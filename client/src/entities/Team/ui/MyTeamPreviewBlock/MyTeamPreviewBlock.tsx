import { useSelector } from 'react-redux';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Divider, Image, Input } from '@nextui-org/react';
import toast from 'react-hot-toast';

import { getTeamData, getTeamError, getTeamIsLoading } from '../../model/selectors/TeamSelectors';
import { fetchTeam } from '../../model/services/fetchTeam';
import { TeamMembersList } from '../TeamInfoBlock/TeamMembersList/TeamMembersList';
import { leaveTeam } from '../../model/services/leaveTeam';
import { TeamReducer } from '../../model/slice/TeamSlice';
import { Team } from '../../model/types/Team';
import { changeTeam } from '../../model/services/changeTeam';

import classes from './MyTeamPreviewBlock.module.scss';

import { Skeleton } from '@/shared/ui/Skeleton';
import { classNames } from '@/shared/lib/classNames';
import { getUserData, InvitationMembersList } from '@/entities/User';
import { HStack, VStack } from '@/shared/ui/Stack';
import { RoutePath } from '@/shared/config/routeConfig';
import { TextButton } from '@/shared/ui/TextButton';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { DynamicModuleLoader } from '@/shared/lib/DynamicModuleLoader';
import { ProposalReducer } from '@/entities/Proposal';
import { toastDispatch } from '@/widgets/Toaster';
import { ResultEventBlock, useEvents } from '@/entities/Event';
import { AppLink } from '@/shared/ui/AppLink';
import { AutoCompleteTags } from '@/shared/ui/AutoCompleteTags';
import { ExtendedTag } from '@/entities/Skill';
import { usePositions } from '@/entities/Positions';
import { useWindowWidth } from '@/shared/lib/hooks/useWindowWidth';

interface MyTeamPreviewBlockProps {
    className?: string;
    setCreateTeamModalOpened: (state: boolean) => void;
}

export const MyTeamPreviewBlock = (props: MyTeamPreviewBlockProps) => {
    const { className, setCreateTeamModalOpened } = props;

    const userData = useSelector(getUserData);
    const teamData = useSelector(getTeamData);
    const teamFetchingError = useSelector(getTeamError);
    const isTeamLoading = useSelector(getTeamIsLoading);

    const { isMobile } = useWindowWidth();

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const [isAddMembersModal, setIsAddMembersModal] = useState<boolean>(false);
    const [isEditorMode, setIsEditorMode] = useState<boolean>(false);
    const [changedTeamData, setChangedTeamData] = useState<Partial<Team>>({});
    const [selectedPositions, setSelectedPositions] = useState<ExtendedTag[]>([]);

    const { data: oldEvents, isLoading: isOldEventsLoading } = useEvents('old');
    const { data: positions } = usePositions(undefined, { refetchOnMountOrArgChange: true });

    useEffect(() => {
        if (userData?.teamId) {
            dispatch(fetchTeam(userData?.teamId?.toString()));
        }
    }, [dispatch, userData?.teamId]);

    useEffect(() => {
        if (teamData) setChangedTeamData(teamData);
    }, [teamData]);

    useEffect(() => {
        if (changedTeamData?.wantedPositions?.length) {
            setSelectedPositions(
                changedTeamData?.wantedPositions.map((position) => ({
                    label: position,
                    value: position,
                })),
            );
        }
    }, [changedTeamData?.wantedPositions, setSelectedPositions]);

    const handleFindTeamClick = useCallback(() => {
        navigate(RoutePath.teams);
    }, [navigate]);

    const handleCreateTeamClick = useCallback(() => {
        setCreateTeamModalOpened(true);
    }, [setCreateTeamModalOpened]);

    const handleTransferRights = useCallback((userId?: number) => {
        if (userId) {
            toast.success(`Вы собираетесь передать капитанство пользователю с id = ${userId}`);
        }
    }, []);

    const handleInviteMembers = useCallback(() => {
        setIsAddMembersModal(true);
    }, []);

    const handleProposalNavigate = useCallback(() => {
        navigate(`${RoutePath.feed}?tab=proposals`);
    }, [navigate]);

    const handleLeaveTeamClick = useCallback(async () => {
        await toastDispatch(dispatch(leaveTeam()), {
            loading: 'Чистим следы...',
            success: 'Ищите новую команду!',
            error: 'Сервер не хочет вас отпускать',
        });
    }, [dispatch]);

    const handleChangeTeamData = useCallback(async () => {
        if (isEditorMode) {
            // const isProfilesEqual = JSON.stringify(teamData) === JSON.stringify(changedTeamData);
            // if (isProfilesEqual) {
            //     setIsEditorMode(false);
            //     return;
            // }

            const formData = new FormData();
            Object.entries(changedTeamData).forEach(([key, value]) => {
                if (['title', 'description', 'id', 'eventLocation'].includes(key)) {
                    formData.append(key, value.toString());
                }
            });

            formData.append(
                'wantedPositions',
                selectedPositions.map((position) => position.value).join(','),
            );

            const result = await toastDispatch(dispatch(changeTeam(formData)), {
                loading: 'Сохраняем изменения...',
                success: 'Сохранили!',
                error: 'Что-то не получилось...(',
            });

            if (result.meta.requestStatus === 'fulfilled') {
                if (userData?.teamId) {
                    await dispatch(fetchTeam(userData?.teamId?.toString()));
                }
                setIsEditorMode(false);
            }
        } else {
            setIsEditorMode(true);
        }
    }, [changedTeamData, dispatch, isEditorMode, selectedPositions, userData?.teamId]);

    if (isTeamLoading) {
        return (
            <DynamicModuleLoader reducers={{ proposal: ProposalReducer, team: TeamReducer }}>
                <VStack
                    gap="12px"
                    maxW
                    className={classNames(classes.MyTeamPreviewBlock, {}, [className])}
                >
                    <HStack gap="24px" maxW align="start">
                        {!isMobile && <Skeleton width="100px" height="100px" />}
                        <VStack gap="12px">
                            <HStack justify="between">
                                <HStack maxW gap="12px">
                                    <h1 className="text-l font-bold">Ваша команда:</h1>
                                    <Skeleton width="50%" height="28px" />
                                </HStack>
                                <HStack maxW justify="end">
                                    <Skeleton width="22%" height="28px" />
                                    <Skeleton width="22%" height="28px" />
                                </HStack>
                            </HStack>
                            <VStack maxW gap="4px">
                                {new Array(3).fill(0).map((_, index) => (
                                    <Skeleton key={index} width="60%" height="16px" />
                                ))}
                                <Skeleton width="40%" height="16px" />
                            </VStack>
                        </VStack>
                    </HStack>

                    <Divider />

                    <VStack maxW>
                        <HStack maxW justify="between">
                            <HStack maxW gap="6px">
                                <h2 className="text-l italic">Участники команды (</h2>
                                <Skeleton width="24px" height="28px" />
                                <h2 className="text-l italic">/ 10):</h2>
                            </HStack>
                            <Skeleton width="16%" height="28px" />
                        </HStack>
                        <VStack maxW gap="4px">
                            <Skeleton width="33%" height="16px" />
                            <Skeleton width="33%" height="16px" />
                            <Skeleton width="33%" height="16px" />
                            <Skeleton width="33%" height="16px" />
                        </VStack>
                    </VStack>
                </VStack>
            </DynamicModuleLoader>
        );
    }

    if (teamFetchingError) {
        return (
            <DynamicModuleLoader reducers={{ proposal: ProposalReducer, team: TeamReducer }}>
                <VStack
                    gap="12px"
                    maxW
                    className={classNames(classes.MyTeamPreviewBlock, {}, [className])}
                >
                    <p className="text-red-400 text-center italic">
                        Не удалось получить данные о команде. Попробуйте позже
                    </p>
                </VStack>
            </DynamicModuleLoader>
        );
    }

    if (!userData?.teamId) {
        return (
            <DynamicModuleLoader reducers={{ proposal: ProposalReducer, team: TeamReducer }}>
                <VStack maxW className={classNames(classes.MyTeamPreviewBlock, {}, [className])}>
                    <h1 className="text-l">
                        Вы <span className="text-red-400">не</span> состоите в команде.
                    </h1>
                    <span>
                        Самое время <TextButton onClick={handleFindTeamClick}>найти ее</TextButton>{' '}
                        или <TextButton onClick={handleCreateTeamClick}>создать свою</TextButton>!
                    </span>
                    <p className="mt-4 italic opacity-40">
                        * посмотрите раздел{' '}
                        <TextButton onClick={handleProposalNavigate}>Заявки</TextButton> — может
                        быть, Вас пригласили
                    </p>
                </VStack>
            </DynamicModuleLoader>
        );
    }

    return (
        <DynamicModuleLoader reducers={{ proposal: ProposalReducer, team: TeamReducer }}>
            <VStack
                gap="12px"
                maxW
                className={classNames(classes.MyTeamPreviewBlock, {}, [className])}
            >
                <HStack maxW gap="24px" align="start">
                    {!isMobile && (
                        <Image
                            className="w-[100px] h-[100px]"
                            src={`/team-images/${changedTeamData?.image}`}
                            fallbackSrc="/static/fallbacks/team-fallback.webp"
                            classNames={{
                                wrapper: classes.teamImageWrapper,
                            }}
                        />
                    )}

                    <VStack gap="12px" maxW>
                        <HStack
                            className={isMobile ? 'flex-col gap-0' : ''}
                            maxW
                            gap="12px"
                            justify="between"
                        >
                            <HStack className={isMobile ? 'flex-col gap-0' : ''}>
                                <h1 className="text-m md:text-l font-bold">Ваша команда: </h1>
                                <input
                                    onChange={(event) =>
                                        setChangedTeamData({
                                            ...changedTeamData,
                                            title: event.target.value,
                                        })
                                    }
                                    disabled={!isEditorMode}
                                    className={
                                        isEditorMode
                                            ? 'text-center rounded-md p-1 inline italic text-l bg-transparent outline outline-1 outline-accent'
                                            : 'text-center rounded-md p-1 inline italic text-l bg-transparent'
                                    }
                                    value={changedTeamData?.title}
                                />
                            </HStack>
                            {changedTeamData?.captain_id === userData.id && (
                                <span className="text-l italic opacity-50 text-green-600">
                                    (капитан)
                                </span>
                            )}
                        </HStack>
                        <textarea
                            disabled={!isEditorMode}
                            onChange={(event) =>
                                setChangedTeamData({
                                    ...changedTeamData,
                                    description: event.target.value,
                                })
                            }
                            value={changedTeamData?.description}
                            className={
                                isEditorMode
                                    ? 'rounded-md p-1 w-full lg:w-2/3 inline italic resize-none bg-transparent outline outline-1 outline-accent'
                                    : 'rounded-md p-1 w-full lg:w-2/3 inline italic resize-none bg-transparent'
                            }
                        />
                        <VStack gap="8px" maxW>
                            <Input
                                isDisabled={!isEditorMode}
                                className="md:w-full lg:w-2/3"
                                size="sm"
                                label="Место дислокации"
                                value={changedTeamData.eventLocation}
                                onChange={(event) =>
                                    setChangedTeamData({
                                        ...changedTeamData,
                                        eventLocation: event.target.value,
                                    })
                                }
                            />
                            <AutoCompleteTags
                                allowNew={false}
                                className="md:w-full lg:w-2/3"
                                items={positions}
                                selectedItems={selectedPositions}
                                setSelectedItems={setSelectedPositions}
                                isDisabled={!isEditorMode}
                                label="Требуемые позиции"
                                placeholder="Выберите позиции"
                            />
                        </VStack>
                        <HStack maxW gap="12px" justify="end">
                            <Button
                                onClick={handleLeaveTeamClick}
                                size="sm"
                                className="bg-red-200 text-main-bg"
                            >
                                Покинуть команду
                            </Button>
                            {userData.id === teamData?.captain_id ? (
                                <Button
                                    onClick={handleChangeTeamData}
                                    size="sm"
                                    className="bg-green-200 text-main-bg"
                                >
                                    {isEditorMode ? 'Сохранить' : 'Изменить команду'}
                                </Button>
                            ) : null}
                        </HStack>
                    </VStack>
                </HStack>

                <Divider />
                <VStack maxW gap="24px">
                    <HStack className={isMobile ? 'flex-col gap-4' : ''} maxW justify="between">
                        {teamData?.members ? (
                            <h2 className="text-l italic">
                                Участники команды ({teamData?.members.length} / 10):
                            </h2>
                        ) : (
                            <h2>Странно конечно но участников нет </h2>
                        )}
                        <HStack gap="12px">
                            <Button
                                type="button"
                                color="warning"
                                as={AppLink}
                                to={`${RoutePath.teammessenger + teamData?.id}/messenger`}
                                size="sm"
                            >
                                В командный чат
                            </Button>
                            {userData.id === changedTeamData?.captain_id && (
                                <Button
                                    type="button"
                                    onClick={handleInviteMembers}
                                    className="bg-green-300 text-main-bg"
                                    size="sm"
                                >
                                    Пригласить участников
                                </Button>
                            )}
                        </HStack>
                    </HStack>
                    {teamData && (
                        <TeamMembersList
                            allowRightsTransfer
                            onRightsTransferClick={handleTransferRights}
                            team={teamData}
                        />
                    )}

                    {oldEvents?.length ? (
                        <VStack maxW gap="12px">
                            <Divider />
                            <VStack maxW gap="0">
                                <h1 className="text-l">Ваши прошедшие мероприятия</h1>
                                <p className="italic opacity-60">
                                    Укажите результаты соревнований, в которых Вы принимали участие,
                                    чтобы добавить их как достижение в профиль команды и избежать
                                    санкций
                                </p>
                            </VStack>
                            {oldEvents.map((event) => (
                                <ResultEventBlock team={teamData} event={event} />
                            ))}
                        </VStack>
                    ) : null}
                </VStack>

                <InvitationMembersList
                    isOpened={isAddMembersModal}
                    setIsOpened={setIsAddMembersModal}
                />
            </VStack>
        </DynamicModuleLoader>
    );
};
