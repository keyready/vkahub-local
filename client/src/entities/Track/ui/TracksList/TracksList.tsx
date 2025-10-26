import { TrackCard } from '../TrackCard/TrackCard';

import { classNames } from '@/shared/lib/classNames';
import { HStack } from '@/shared/ui/Stack';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Track } from '@/entities/Track';

interface TracksListProps {
    className?: string;
    tracks?: Track[];
    isLoading?: boolean;
}

export const TracksList = (props: TracksListProps) => {
    const { className, isLoading, tracks } = props;

    if (isLoading) {
        return (
            <HStack justify="between" gap="24px" maxW className="flex-wrap">
                <Skeleton width="30%" height="150px" rounded={12} />
                <Skeleton width="30%" height="150px" rounded={12} />
                <Skeleton width="30%" height="150px" rounded={12} />
            </HStack>
        );
    }

    if (!tracks?.length) {
        return (
            <HStack maxW className="flex-wrap">
                <h1 className="italic text-l text-opacity-70">
                    У данного мероприятия нет направлений.
                </h1>
            </HStack>
        );
    }

    return (
        <HStack
            gap="24px"
            justify="between"
            maxW
            className={classNames(`grid lg:grid-cols-3 sm:grid-cols-2`, {}, [className])}
        >
            {tracks?.map((track) => (
                <TrackCard key={track.id} track={track} />
            ))}
        </HStack>
    );
};
