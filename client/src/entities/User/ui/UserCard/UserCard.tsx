import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, cn } from '@nextui-org/react';
import { RiArrowRightSLine } from '@remixicon/react';
import { useNavigate } from 'react-router-dom';

import { User } from '../../model/types/User';

import classes from './UserCard.module.scss';

import { HStack, VStack } from '@/shared/ui/Stack';
import { RoutePath } from '@/shared/config/routeConfig';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { ProposalReducer } from '@/entities/Proposal';
import { DynamicModuleLoader } from '@/shared/lib/DynamicModuleLoader';
import { fetchTeam } from '@/entities/Team';
import { useWindowWidth } from '@/shared/lib/hooks/useWindowWidth';

interface UserCardProps {
    className?: string;
    user: User;
}

export const UserCard = memo((props: UserCardProps) => {
    const { className, user } = props;

    const navigate = useNavigate();

    const { isMobile } = useWindowWidth();

    const [isOpened, setIsOpened] = useState<boolean>(false);
    const [userTeamTitle, setUserTeamTitle] = useState<string>('');

    const dispatch = useAppDispatch();

    const handleProfileClick = useCallback(() => {
        navigate(RoutePath.member + user.username);
    }, [navigate, user.username]);

    const renderUserSkill = useMemo(() => {
        if (!user.skills?.length) return 'Не указаны';

        if (user.skills?.length >= 5) {
            return `${user.skills.slice(0, 4).join(', ')}... (+${user.skills?.slice(4).length})`;
        }
        return user.skills.join(', ');
    }, [user.skills]);

    useEffect(() => {
        const fetchUserTeamTitle = async () => {
            if (user.teamId) {
                const result = await dispatch(fetchTeam(user.teamId.toString()));
                if (result?.payload && typeof result.payload !== 'string') {
                    setUserTeamTitle(result.payload.title);
                }
            }
        };

        fetchUserTeamTitle();
    }, [dispatch, user.teamId]);

    if (isOpened) {
        return (
            <VStack
                maxW
                className={cn(
                    'border-2 border-card-bg p-2 hover:bg-card-bg duration-200',
                    classes.UserCardOpened,
                )}
            >
                <button type="button" className="w-full" onClick={() => setIsOpened(false)}>
                    <HStack className="col-span-4" gap="12px">
                        <div className={classes.img} />
                        <h3 className="text-l">
                            {user.lastname} {user.firstname}{' '}
                            <span className="italic opacity-30">({user.username})</span>
                        </h3>
                    </HStack>
                </button>

                <VStack maxW className={isMobile ? 'px-0' : 'px-16'} gap="12px">
                    {user.teamId ? (
                        <p>
                            {user.firstname} состоит в команде {userTeamTitle}
                        </p>
                    ) : (
                        <p>{user.firstname} не состоит в команде.</p>
                    )}
                </VStack>

                <VStack maxW className={isMobile ? 'px-0' : 'px-16'} gap="">
                    {user.skills?.length ? (
                        <p>
                            <b>Навыки:</b> {user.skills.join(', ')}
                        </p>
                    ) : null}
                    {user.positions?.length ? (
                        <p>
                            <b>Занимаемые позиции:</b> {user.positions.join(', ')}
                        </p>
                    ) : null}
                </VStack>

                <Button
                    size="sm"
                    onClick={handleProfileClick}
                    className="bg-accent text-white mt-5 self-end"
                >
                    <RiArrowRightSLine />
                </Button>
            </VStack>
        );
    }

    return (
        <DynamicModuleLoader reducers={{ proposal: ProposalReducer }}>
            <button type="button" className="w-full" onClick={() => setIsOpened(true)}>
                <div
                    className={cn(
                        'grid grid-cols-7 gap-6 items-center align-center w-full',
                        'rounded-xl border-2 border-card-bg p-2 hover:bg-card-bg duration-200',
                    )}
                >
                    <HStack className="col-span-4" gap="12px">
                        <div className={classes.img} />
                        <h3 className="text-start text-l">
                            {user.lastname} {user.firstname}{' '}
                            <span className="italic opacity-30">({user.username})</span>
                        </h3>
                    </HStack>

                    <HStack gap="24px" justify="between" align="start" className="col-span-3">
                        {!isMobile && (
                            <VStack gap="0">
                                <p className="leading-none">Навыки:</p>
                                <p className="leading-none capitalize">{renderUserSkill}</p>
                            </VStack>
                        )}

                        <p>
                            Состоит в команде:{' '}
                            <span className={user.teamId ? 'text-green-400' : 'text-red-400'}>
                                {user.teamId ? 'да' : 'нет'}
                            </span>
                        </p>
                    </HStack>
                </div>
            </button>
        </DynamicModuleLoader>
    );
});
