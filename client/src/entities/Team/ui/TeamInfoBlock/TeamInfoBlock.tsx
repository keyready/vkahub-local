import { Image } from '@nextui-org/react';

import { Team } from '../../model/types/Team';

import classes from './TeamInfoBlock.module.scss';
import { TeamMembersList } from './TeamMembersList/TeamMembersList';

import { Skeleton } from '@/shared/ui/Skeleton';
import { classNames } from '@/shared/lib/classNames';
import { HStack, VStack } from '@/shared/ui/Stack';
import { AchievementsTable } from '@/entities/Achievement';
import { useWindowWidth } from '@/shared/lib/hooks/useWindowWidth';

interface TeamInfoBlockProps {
    className?: string;
    team?: Team;
    isLoading?: boolean;
}

export const TeamInfoBlock = (props: TeamInfoBlockProps) => {
    const { className, isLoading, team } = props;

    const { isMobile } = useWindowWidth();

    if (isLoading) {
        return (
            <HStack maxH justify="between" align="start" maxW gap="32px">
                {!isMobile && (
                    <VStack align="start" justify="start">
                        <Skeleton width={400} height={400} rounded={24} />
                    </VStack>
                )}

                <VStack gap="24px" maxW>
                    <HStack gap="12px" maxW className="w-full" align="center">
                        <Skeleton width={400} height={35} />
                    </HStack>

                    <VStack gap="12px" maxW className="flex-grow h-full p-5 rounded-xl bg-card-bg">
                        <VStack maxW>
                            <p className="opacity-30 text-m">О команде</p>
                            <Skeleton width="100%" height={15} />
                            <Skeleton width="100%" height={15} />
                            <Skeleton width="100%" height={15} />
                            <Skeleton width="75%" height={15} />
                        </VStack>
                        <hr className="w-full border-t-2 border-main-bg" />
                        <HStack maxW gap="12px" className="flex-wrap">
                            <Skeleton width="50%" height={15} />
                        </HStack>
                    </VStack>

                    <VStack
                        gap="0"
                        maxW
                        className="h-full flex-grow relative py-0 rounded-xl bg-card-bg overflow-y-auto"
                    >
                        <h2 className="px-5 w-full bg-card-bg pt-5 sticky top-0 text-l underline underline-offset-2">
                            Достижения
                        </h2>
                        <VStack gap="12px" maxW className="p-4">
                            <Skeleton width="100%" height={35} />
                            <Skeleton width="100%" height={35} />
                            <Skeleton width="100%" height={35} />
                            <Skeleton width="100%" height={35} />
                            <Skeleton width="100%" height={35} />
                        </VStack>
                    </VStack>
                </VStack>
            </HStack>
        );
    }

    if (!team) return null;

    return (
        <HStack
            align="start"
            gap="32px"
            maxW
            className={classNames(classes.TeamInfoBlock, {}, [className])}
        >
            {!isMobile && (
                <HStack justify="center" align="start">
                    <Image
                        fallbackSrc="/static/fallbacks/team-fallback.webp"
                        classNames={{ wrapper: classes.blurredBackgroundImage }}
                        className="w-full h-full"
                        src={`/team-images/${team?.image}`}
                        alt={team?.title}
                    />
                </HStack>
            )}

            <VStack gap="24px" maxW align="start">
                <h1 className="font-bold text-2xl w-full">{team.title}</h1>
                <VStack maxW className="flex-grow h-full p-5 rounded-xl bg-card-bg">
                    <p className="opacity-30 text-m">О команде</p>
                    <p className="italic">{team?.description}</p>
                </VStack>

                <VStack maxW className="flex-grow h-full p-5 rounded-xl bg-card-bg">
                    <p className="opacity-30 text-m">Участники команды</p>
                    <TeamMembersList team={team} />
                </VStack>

                <VStack maxW className="flex-grow h-full rounded-xl bg-card-bg">
                    {isLoading ? (
                        <VStack maxW className="p-4 bg-card-bg">
                            {new Array(5).fill(0).map((_, index) => (
                                <Skeleton width="100%" height={40} key={index} />
                            ))}
                        </VStack>
                    ) : (
                        <AchievementsTable teamId={team?.id || -1} />
                    )}
                </VStack>
            </VStack>
        </HStack>
    );
};
