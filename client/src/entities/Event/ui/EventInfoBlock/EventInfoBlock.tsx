import { Button, Chip, Image } from '@nextui-org/react';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { Event } from '../../model/types/Event';

import classes from './EventInfoBlock.module.scss';

import { HStack, VStack } from '@/shared/ui/Stack';
import { DisplayTimer } from '@/shared/ui/DisplayTimer';
import { Skeleton } from '@/shared/ui/Skeleton';
import { TrackReducer, TracksList, useEventTracks } from '@/entities/Track';
import { DynamicModuleLoader } from '@/shared/lib/DynamicModuleLoader';
import { getTeamData, TeamReducer } from '@/entities/Team';
import { getUserData } from '@/entities/User';
import { useWindowWidth } from '@/shared/lib/hooks/useWindowWidth';

type ButtonColors = 'default' | 'success' | 'warning' | 'primary' | 'secondary' | 'danger';

interface EventInfoBlockProps {
    className?: string;
    event?: Event;
    isLoading?: boolean;
}

export const EventInfoBlock = (props: EventInfoBlockProps) => {
    const { className, event, isLoading } = props;

    const { data: tracks, isLoading: isTracksLoading } = useEventTracks(event?.id || -1);
    const { isMobile } = useWindowWidth();

    const userTeamData = useSelector(getTeamData);
    const userData = useSelector(getUserData);

    const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);
    const [buttonColor, setButtonColor] = useState<ButtonColors>('default');

    const renderButtonText = useMemo(() => {
        if (!event?.finishDate) {
            return 'Технические неполадки';
        }

        const finishDate = new Date(event?.finishDate).getTime();
        const today = new Date().getTime();

        if (!userData?.teamId) {
            setIsButtonDisabled(true);
            return 'Участие возможно только в команде';
        }

        if (
            event.participantsTeamsIds &&
            event.participantsTeamsIds.includes(userTeamData?.id || '')
        ) {
            setIsButtonDisabled(true);
            setButtonColor('success');
            return 'Вы уже зарегистрированы на это мероприятие';
        }

        if (today > finishDate) {
            setIsButtonDisabled(true);
            return 'Регистрация закончилась';
        }

        setIsButtonDisabled(false);
        setButtonColor('success');
        return 'Зарегистрироваться';
    }, [event?.finishDate, event?.participantsTeamsIds, userData?.teamId, userTeamData?.id]);

    const renderDates = useMemo(() => {
        if (!event?.startDate || !event?.finishDate) return 'Даты прведения не указаны';

        const startDate = new Date(event.startDate).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
        const finishDate = new Date(event.finishDate).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });

        return (
            <VStack>
                <Chip radius="sm" className="text-italic text-accent bg-transparent">
                    {startDate}
                </Chip>
                <Chip radius="sm" className="text-italic text-accent bg-transparent">
                    {finishDate}
                </Chip>
            </VStack>
        );
    }, [event?.finishDate, event?.startDate]);

    if (isLoading) {
        return (
            <VStack maxW gap="48px">
                <HStack maxW align="start" gap="36px" className="mt-10">
                    {!isMobile && (
                        <Skeleton
                            width="25vw"
                            height="25vw"
                            className={classes.imgSkeleton}
                            rounded="24px"
                        />
                    )}
                    <VStack maxW>
                        <HStack align="start" maxW justify="between">
                            <Skeleton width="33%" height={30} />
                            <VStack className="w-1/12">
                                <Skeleton width="100%" height={20} />
                                <Skeleton width="100%" height={20} />
                            </VStack>
                        </HStack>

                        <Skeleton width="66%" height={12} />
                        <Skeleton width="66%" height={12} />
                        <Skeleton width="66%" height={12} />
                        <Skeleton width="50%" height={12} />

                        <h3 className="font-bold text-l mt-10">При поддержке:</h3>
                        <HStack maxW gap="12px" className="flex-wrap">
                            <Skeleton width="80px" height={24} />
                            <Skeleton width="80px" height={24} />
                            <Skeleton width="80px" height={24} />
                            <Skeleton width="80px" height={24} />
                        </HStack>

                        <h3 className="font-bold text-l mt-10">До окончания регистрации:</h3>
                        <HStack maxW gap="12px">
                            <Skeleton rounded={12} width="15%" height={200} />
                            <Skeleton rounded={12} width="15%" height={200} />
                            <Skeleton rounded={12} width="15%" height={200} />
                            <Skeleton rounded={12} width="15%" height={200} />
                        </HStack>
                    </VStack>
                </HStack>

                <h1 className="text-xl font-bold">Направления</h1>
            </VStack>
        );
    }

    return (
        <DynamicModuleLoader reducers={{ team: TeamReducer, track: TrackReducer }}>
            <VStack maxW gap="48px">
                <HStack maxW align="start" gap="36px" className="mt-10">
                    {!isMobile && (
                        <Image
                            width="25vw"
                            height="25vw"
                            classNames={{
                                wrapper: classes.img,
                            }}
                            src={`/events-images/${event?.image}`}
                            className="w-full h-full"
                            fallbackSrc={`/static/events-types/${event?.type}-fallback.webp`}
                        />
                    )}
                    <VStack maxW>
                        <HStack align="start" maxW justify="between">
                            <h1 className="md:leading-none leading-1 my-4 text-left font-bold text-xl md:text-2xl">
                                {event?.title}
                            </h1>
                            {renderDates}
                        </HStack>

                        <p className="italic mt-5">{event?.description}</p>

                        <h3 className="font-bold text-l mt-10">При поддержке:</h3>
                        <HStack maxW className="flex-wrap">
                            {event?.sponsors?.length ? (
                                event.sponsors.map((sponsor) => (
                                    <Chip
                                        classNames={{
                                            base: 'bg-accent',
                                        }}
                                        radius="sm"
                                        key={sponsor}
                                        className="mr-2"
                                        color="secondary"
                                    >
                                        {sponsor}
                                    </Chip>
                                ))
                            ) : (
                                <p>Спонсоров нет ;(</p>
                            )}
                        </HStack>

                        <HStack justify="between" maxW>
                            <VStack maxW>
                                <h3 className="font-bold text-l mt-10">
                                    До окончания регистрации:
                                </h3>
                                <DisplayTimer time={event?.registerUntil} />
                            </VStack>

                            {!tracks?.length ? (
                                <Button
                                    size="lg"
                                    isDisabled={isButtonDisabled}
                                    className="text-wrap text-black"
                                    color={buttonColor}
                                >
                                    {renderButtonText}
                                </Button>
                            ) : null}
                        </HStack>
                    </VStack>
                </HStack>

                {tracks?.length ? (
                    <VStack maxW gap="24px">
                        <h1 className="text-xl font-bold">Направления</h1>
                        {event?.id && <TracksList tracks={tracks} isLoading={isTracksLoading} />}
                    </VStack>
                ) : null}
            </VStack>
        </DynamicModuleLoader>
    );
};
