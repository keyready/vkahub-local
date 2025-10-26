import { Event } from '../../model/types/Event';

import { classNames } from '@/shared/lib/classNames';
import { HStack } from '@/shared/ui/Stack';
import { AppLink } from '@/shared/ui/AppLink';
import { RoutePath } from '@/shared/config/routeConfig';
import { AchievementReducer, CreateAchievementSelector } from '@/entities/Achievement';
import { Team } from '@/entities/Team';
import { DynamicModuleLoader } from '@/shared/lib/DynamicModuleLoader';
import { useWindowWidth } from '@/shared/lib/hooks/useWindowWidth';

interface ResultEventBlockProps {
    className?: string;
    event: Event;
    team?: Team;
}

export const ResultEventBlock = (props: ResultEventBlockProps) => {
    const { className, event, team } = props;

    const { isMobile } = useWindowWidth();

    return (
        <DynamicModuleLoader reducers={{ achievement: AchievementReducer }}>
            <HStack
                className={classNames(
                    'px-4 py-2 border-2 border-main rounded-lg',
                    { 'flex-col gap-2': isMobile },
                    [className],
                )}
                maxW
                justify="between"
                key={event.id}
            >
                <AppLink target="_blank" className="text-primary" to={RoutePath.event + event.id}>
                    {event.title}
                </AppLink>
                <CreateAchievementSelector teamId={team?.id} eventId={event.id} />
            </HStack>
        </DynamicModuleLoader>
    );
};
