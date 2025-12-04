import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, cn } from '@nextui-org/react';
import { RiArrowRightSLine } from '@remixicon/react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { User } from '../../model/types/User';

import { HStack, VStack } from '@/shared/ui/Stack';
import { Image } from '@/shared/ui/Image';
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

    return (
        <DynamicModuleLoader reducers={{ proposal: ProposalReducer }}>
            <motion.div
                layout
                transition={{ duration: 0.3 }}
                className={cn(
                    'w-full rounded-xl border-2 border-card-bg overflow-x-hidden',
                    'p-2 hover:bg-card-bg duration-200 cursor-pointer',
                    className,
                )}
                onClick={() => setIsOpened((prev) => !prev)}
            >
                <HStack className="w-full justify-between items-start" gap="12px">
                    <div className="flex items-center gap-4">
                        <Image
                            src={`/minio/${user.avatar?.image}`}
                            hash={user.avatar?.hash}
                            fallbackSrc="/static/fallbacks/user-fallback.webp"
                            classNames={{
                                wrapper: 'rounded-full',
                            }}
                            width={50}
                            height={50}
                        />
                        <h3 className="text-start text-l">
                            {user.lastname} {user.firstname}{' '}
                            <span className="italic opacity-30">({user.username})</span>
                        </h3>
                    </div>

                    <AnimatePresence mode="wait">
                        {!isOpened && (
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                exit={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="mt-2 flex gap-4 h-full items-start"
                            >
                                {!isMobile && (
                                    <VStack gap="0">
                                        <p className="leading-none">Навыки:</p>
                                        <p className="leading-none capitalize">{renderUserSkill}</p>
                                    </VStack>
                                )}
                                <p>
                                    Состоит в команде:{' '}
                                    <span
                                        className={user.teamId ? 'text-green-400' : 'text-red-400'}
                                    >
                                        {user.teamId ? 'да' : 'нет'}
                                    </span>
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </HStack>

                <AnimatePresence initial={false}>
                    {isOpened && (
                        <motion.div
                            key="expanded-content"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                        >
                            <VStack className="gap-2 mt-4 pt-2 border-t border-divider">
                                <div className="flex flex-col gap-3 ml-16">
                                    {user.teamId ? (
                                        <p>
                                            {user.firstname} состоит в команде {userTeamTitle}
                                        </p>
                                    ) : (
                                        <p>{user.firstname} не состоит в команде.</p>
                                    )}

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
                                </div>

                                <Button
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleProfileClick();
                                    }}
                                    className="bg-accent text-white mt-4 self-end"
                                >
                                    <RiArrowRightSLine />
                                </Button>
                            </VStack>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </DynamicModuleLoader>
    );
});
