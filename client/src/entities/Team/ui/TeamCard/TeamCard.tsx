import { memo, useCallback } from 'react';
import { RiTeamLine } from '@remixicon/react';
import { useNavigate } from 'react-router-dom';
import { Image } from '@nextui-org/react';

import { Team } from '../../model/types/Team';
import { DisplayVariant } from '../TeamsDisplaySelector/TeamsDisplaySelector';

import classes from './TeamCard.module.scss';

import { Skeleton } from '@/shared/ui/Skeleton';
import { classNames, Mods } from '@/shared/lib/classNames';
import { HStack, VStack } from '@/shared/ui/Stack';
import { RoutePath } from '@/shared/config/routeConfig';
import { useWindowWidth } from '@/shared/lib/hooks/useWindowWidth';

interface TeamCardProps {
    className?: string;
    team?: Team;
    displayVariant?: DisplayVariant;
    isLoading?: boolean;
}

export const TeamCard = memo((props: TeamCardProps) => {
    const { className, isLoading, team, displayVariant = 'compact' } = props;

    const { isMobile } = useWindowWidth();

    const mods: Mods = {
        [classes.grid]: displayVariant === 'compact',
        [classes.flex]: displayVariant === 'detailed',
    };

    const navigate = useNavigate();

    const handleCardClick = useCallback(() => {
        const teamTitle = team?.title
            .toLowerCase()
            .replace(/[^a-zа-яё0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        navigate(`${RoutePath.team}${team?.id}/${teamTitle}`);
    }, [navigate, team?.id, team?.title]);

    if (isLoading) {
        return (
            <HStack
                gap="12px"
                align="start"
                maxW
                className="w-full rounded-xl border-2 border-card-bg p-4"
            >
                <Skeleton width="80px" height="80px" rounded={12} />
                <VStack className="w-2/4">
                    <Skeleton width="100%" height="20px" rounded={4} />
                    <Skeleton width="60%" height="13px" rounded={4} />
                </VStack>
            </HStack>
        );
    }

    if (displayVariant === 'compact') {
        return (
            <VStack
                role="button"
                onClick={handleCardClick}
                maxW
                align="center"
                gap="16px"
                className={classNames('bg-card-bg p-4 rounded-xl', mods, [
                    className,
                    classes.TeamCard,
                ])}
            >
                <div className="relative w-36 h-36 rounded-2xl">
                    <Image
                        width="100%"
                        height="100%"
                        fallbackSrc="/static/fallbacks/team-fallback.webp"
                        src={`/team-images/${team?.image}`}
                        classNames={{ wrapper: classes.compactTeamImg }}
                    />
                    <HStack maxW justify="end" className="p-2.5">
                        <div className="bg-white text-gray-700 z-10 rounded-xl px-2 py-1 text-l">
                            {team?.members?.length}/5
                        </div>
                    </HStack>
                </div>
                <HStack maxW>
                    <h1 className="w-full text-center text-xl">{team?.title}</h1>
                </HStack>
            </VStack>
        );
    }

    return (
        <HStack
            role="button"
            onClick={handleCardClick}
            maxW
            align="start"
            justify="between"
            className="w-full rounded-xl border-2 border-card-bg p-4 hover:bg-card-bg duration-200"
        >
            <HStack maxW gap="24px">
                <Image
                    width={isMobile ? 60 : 80}
                    height={isMobile ? 60 : 80}
                    fallbackSrc="/static/fallbacks/team-fallback.webp"
                    src={`/team-images/${team?.image}`}
                    classNames={{ wrapper: classes.teamCardImg }}
                />
                <VStack maxW>
                    <h1 className="text-m md:text-xl">{team?.title}</h1>
                    <p className="text-s md:text-m italic">
                        {team?.description.slice(0, isMobile ? 30 : 130)}...
                    </p>
                </VStack>
            </HStack>

            <HStack gap="12px" className={classes.membersCountWrapper}>
                <RiTeamLine className="text-main" size={28} />
                <div className="text-m md:text-xl">{team?.members?.length} / 10</div>
            </HStack>
        </HStack>
    );
});
