/**
 * Ну я же не много прошу: просто чтобы айдишник команды был. И все. Базовые потребности удовлетворить...
 */

import { useSelector } from 'react-redux';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
    Autocomplete,
    AutocompleteItem,
    AutocompleteSection,
    Button,
    Image,
    Input,
    Textarea,
    Tooltip,
} from '@nextui-org/react';
import { RiCloseLine, RiEditLine, RiSaveLine } from '@remixicon/react';

import { changeUserProfile } from '../../../model/services/profileServices/changeUserProfile';
import { getIsProfileChanging, getUserData } from '../../../model/selectors/UserSelectors';
import { User, UserRoles } from '../../../model/types/User';
import { RecoveryQuestionSelector } from '../../RecoveryPasswordModal/RecoveryQuestionSelector';

import classes from './ProfileInfoBlock.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { HStack, VStack } from '@/shared/ui/Stack';
import { toastDispatch } from '@/widgets/Toaster';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { getUserDataService, getUserRoles } from '@/entities/User';
import { useWindowWidth } from '@/shared/lib/hooks/useWindowWidth';
import { ImageUpload } from '@/shared/ui/ImageUpload';

interface ProfileInfoBlockProps {
    className?: string;
}

const soldiersRanks = ['курсант', 'мл. сержант', 'сержант', 'ст. сержант'];
const officersRanks = [
    'лейтенант',
    'ст. лейтенант',
    'капитан',
    'майор',
    'подполковник',
    'полковник',
];

export const ProfileInfoBlock = (props: ProfileInfoBlockProps) => {
    const { className } = props;

    const userData = useSelector(getUserData);
    const userRoles = useSelector(getUserRoles);
    const dispatch = useAppDispatch();

    const { isMobile } = useWindowWidth();

    const [changedUserData, setChangedUserData] = useState<Partial<User>>();
    const [isEditorMode, setIsEditorMode] = useState<boolean>(false);

    const isProfileChanging = useSelector(getIsProfileChanging);

    const isProfilesEqual = useMemo(
        () => JSON.stringify(userData) === JSON.stringify(changedUserData),
        [changedUserData, userData],
    );

    const isSaveButtonDisabled = useMemo(
        () => isProfileChanging || isProfileChanging || isProfilesEqual,
        [isProfileChanging, isProfilesEqual],
    );

    useEffect(() => {
        setChangedUserData(userData);
    }, [userData]);

    const renderAlertMessage = useMemo(() => {
        if (!userRoles.includes(UserRoles.PROFILE_CONFIRMED)) {
            return (
                <p className="italic text-red-300">
                    * Пока Вы не пройдете верификацию аккаунта, Вам будет недоступна бо&#769;льшая
                    часть функций. Не удивляйтесь, если все ссылки введут на эту страницу
                </p>
            );
        }
        if (!userData?.recovery?.answer) {
            return (
                <p className="italic text-red-300">
                    * Пока Вы не выберете пару контрольный вопрос-ответ, вам будет недоступно
                    использование приложения, т.к. разработчики устали удалять пользователей из-за
                    их забывчивости
                </p>
            );
        }
        if (userData?.firstname && !userRoles?.includes(UserRoles.PROFILE_CONFIRMED)) {
            return (
                <VStack maxW>
                    <p className="italic text-red-300">
                        * Ваш профиль находится на верификации. После прохождения этой процедуры,
                        Вам будут доступны все функции сервиса
                    </p>
                    {isEditorMode && (
                        <p className="italic text-orange-300">
                            * Если Вы внесете изменения, скорее всего, время ожидания верификации
                            увеличится
                        </p>
                    )}
                </VStack>
            );
        }

        if (!userRoles.includes(UserRoles.MAIL_CONFIRMED)) {
            return (
                <p className="italic text-red-300">
                    * Для доступа ко всем функциям приложения, Вам необходимо подтвердить почту. На
                    нее было выслано письмо с интрукциями
                </p>
            );
        }

        return null;
    }, [isEditorMode, userData?.firstname, userData?.recovery?.answer, userRoles]);

    const handleChangeProfile = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            await toastDispatch(
                dispatch(changeUserProfile({ ...changedUserData, id: userData?.id })),
            );

            await dispatch(getUserDataService());
            setIsEditorMode(false);
        },
        [changedUserData, dispatch, userData?.id],
    );

    const handleChangeEditorMode = useCallback(() => {
        if (!isEditorMode) {
            setIsEditorMode(true);
        }
    }, [isEditorMode]);

    const handleCancelChanges = useCallback(() => {
        setIsEditorMode(false);
        setChangedUserData(userData);
    }, [userData]);

    const handleChangeImage = useCallback((file: File) => {
        setChangedUserData((ps) => ({
            ...ps,
            newAvatar: file,
        }));
    }, []);

    return (
        <form
            onSubmit={handleChangeProfile}
            className={classNames(classes.ProfileInfoBlock, {}, [className])}
        >
            <VStack gap="24px" maxW>
                <HStack maxW align="start">
                    <VStack maxW gap="0px">
                        <h1 className="text-primary text-l font-bold">Ваш профиль</h1>
                        {renderAlertMessage}
                    </VStack>

                    <HStack>
                        {isEditorMode ? (
                            <>
                                <Button
                                    type="submit"
                                    isDisabled={isSaveButtonDisabled}
                                    className="bg-green-100"
                                >
                                    <RiSaveLine className="text-green-600" />
                                </Button>
                                <Tooltip
                                    classNames={{
                                        content: 'dark:bg-primary',
                                        base: 'dark:before:bg-primary',
                                    }}
                                    content="Отменить изменения"
                                >
                                    <Button
                                        isDisabled={isProfileChanging}
                                        onClick={handleCancelChanges}
                                        className="bg-red-100"
                                    >
                                        <RiCloseLine className="text-red-500" />
                                    </Button>
                                </Tooltip>
                            </>
                        ) : (
                            <Tooltip
                                classNames={{
                                    content: 'dark:bg-primary',
                                    base: 'dark:before:bg-primary',
                                }}
                                content="Редактировать"
                            >
                                <Button
                                    type="button"
                                    onClick={handleChangeEditorMode}
                                    color="success"
                                    className="bg-opacity-50"
                                >
                                    <RiEditLine className="text-main" />
                                </Button>
                            </Tooltip>
                        )}
                    </HStack>
                </HStack>

                <HStack
                    className={isMobile ? 'flex flex-col' : 'flex-row-reverse'}
                    maxW
                    align="start"
                    gap="24px"
                >
                    {isEditorMode ? (
                        <ImageUpload
                            className="w-[200px] h-[200px]"
                            initialImage={
                                import.meta.env.DEV
                                    ? `http://localhost/user-avatars/${userData?.avatar}`
                                    : `/user-avatars/${userData?.avatar}`
                            }
                            onChange={handleChangeImage}
                        />
                    ) : (
                        <Image
                            fallbackSrc="/static/fallbacks/user-fallback.webp"
                            width={200}
                            height={200}
                            classNames={{ wrapper: classes.profileAvatar }}
                            src={
                                import.meta.env.DEV
                                    ? `http://localhost/user-avatars/${userData?.avatar}`
                                    : `/user-avatars/${userData?.avatar}`
                            }
                            alt="Аватар пользователя"
                        />
                    )}

                    <VStack maxW gap="12px">
                        <Input
                            isRequired
                            value={changedUserData?.lastname || ''}
                            onChange={(event) =>
                                setChangedUserData({
                                    ...changedUserData,
                                    lastname: event.target.value,
                                })
                            }
                            isDisabled={!isEditorMode || isProfileChanging}
                            size="sm"
                            label="Фамилия"
                        />
                        <Input
                            isRequired
                            value={changedUserData?.firstname || ''}
                            onChange={(event) =>
                                setChangedUserData({
                                    ...changedUserData,
                                    firstname: event.target.value,
                                })
                            }
                            isDisabled={!isEditorMode || isProfileChanging}
                            size="sm"
                            label="Имя"
                        />
                        <Input
                            isRequired
                            value={changedUserData?.middlename || ''}
                            onChange={(event) =>
                                setChangedUserData({
                                    ...changedUserData,
                                    middlename: event.target.value,
                                })
                            }
                            isDisabled={!isEditorMode || isProfileChanging}
                            size="sm"
                            label="Отчество"
                        />

                        <RecoveryQuestionSelector
                            value={changedUserData?.recovery?.question || ''}
                            onChange={(rq) =>
                                setChangedUserData({
                                    ...changedUserData,
                                    recovery: {
                                        ...(changedUserData?.recovery?.answer
                                            ? { answer: changedUserData?.recovery?.answer }
                                            : { answer: '' }),
                                        question: rq,
                                    },
                                })
                            }
                            isDisabled={!isEditorMode || isProfileChanging}
                        />
                        <Input
                            isRequired
                            value={changedUserData?.recovery?.question || ''}
                            onValueChange={(val) =>
                                setChangedUserData({
                                    ...changedUserData,
                                    recovery: {
                                        ...(changedUserData?.recovery?.question
                                            ? { question: changedUserData?.recovery?.question }
                                            : { question: '' }),
                                        answer: val,
                                    },
                                })
                            }
                            isDisabled={
                                !isEditorMode ||
                                isProfileChanging ||
                                !changedUserData?.recovery?.question
                            }
                            size="sm"
                            label="Ответ на вопрос"
                        />

                        <Autocomplete
                            selectedKey={changedUserData?.rank}
                            onSelectionChange={(value) =>
                                setChangedUserData({
                                    ...changedUserData,
                                    rank: value as string,
                                })
                            }
                            label="Воинское звание"
                            size="sm"
                            isDisabled={!isEditorMode || isProfileChanging}
                            className="w-full"
                        >
                            <AutocompleteSection title="Курсантские звания">
                                {soldiersRanks.map((rank) => (
                                    <AutocompleteItem
                                        classNames={{
                                            title: 'text-main',
                                        }}
                                        key={rank}
                                    >
                                        {rank}
                                    </AutocompleteItem>
                                ))}
                            </AutocompleteSection>
                            <AutocompleteSection title="Офицерские звания">
                                {officersRanks.map((rank) => (
                                    <AutocompleteItem
                                        classNames={{
                                            title: 'text-main',
                                        }}
                                        key={rank}
                                    >
                                        {rank}
                                    </AutocompleteItem>
                                ))}
                            </AutocompleteSection>
                        </Autocomplete>

                        <Input
                            value={changedUserData?.group_number || ''}
                            onChange={(event) =>
                                setChangedUserData({
                                    ...changedUserData,
                                    group_number: event.target.value,
                                })
                            }
                            isDisabled={!isEditorMode || isProfileChanging}
                            size="sm"
                            label="Учебная группа (подразделение)"
                        />

                        <Textarea
                            value={changedUserData?.description || ''}
                            onChange={(event) =>
                                setChangedUserData({
                                    ...changedUserData,
                                    description: event.target.value,
                                })
                            }
                            classNames={{
                                inputWrapper: 'h-full',
                            }}
                            minRows={isEditorMode ? 10 : 4}
                            size="sm"
                            isDisabled={!isEditorMode || isProfileChanging}
                            label="О себе"
                            placeholder="Необязательно, но желательно. Расскажите, чем занимаетесь, свою жизненную позицию или корневые принципы"
                        />
                    </VStack>
                </HStack>
            </VStack>
        </form>
    );
};
