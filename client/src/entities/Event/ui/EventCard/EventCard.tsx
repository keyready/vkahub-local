import { Image } from '@nextui-org/react';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Event } from '../../model/types/Event';

import classes from './EventCard.module.scss';

import { Skeleton } from '@/shared/ui/Skeleton';
import { HStack, VStack } from '@/shared/ui/Stack';
import { RoutePath } from '@/shared/config/routeConfig';
import { useWindowWidth } from '@/shared/lib/hooks/useWindowWidth';

interface EventCardProps {
    className?: string;
    isLoading?: boolean;
    event?: Event;
}

export const EventCard = (props: EventCardProps) => {
    const { className, event, isLoading } = props;

    const navigate = useNavigate();
    const { isMobile } = useWindowWidth();

    const renderDates = useMemo(() => {
        if (!event?.startDate || !event.finishDate) {
            return 'даты проведения не указаны';
        }

        if (new Date(event.startDate).getFullYear() === new Date(event.finishDate).getFullYear()) {
            return `${new Date(event?.startDate).toLocaleString('ru-RU', {
                month: 'numeric',
                day: 'numeric',
            })} - ${new Date(event?.finishDate).toLocaleString('ru-RU', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
            })}`;
        }

        return `${new Date(event?.startDate).toLocaleString('ru-RU', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        })} - ${new Date(event?.finishDate).toLocaleString('ru-RU', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        })}`;
    }, [event?.finishDate, event?.startDate]);

    const renderRegisterDate = useMemo(() => {
        if (!event?.registerUntil) {
            return 'не указано';
        }

        return new Date(event?.registerUntil).toLocaleString('ru-RU', {
            year: '2-digit',
            month: 'numeric',
            day: 'numeric',
        });
    }, [event?.registerUntil]);

    const handleEventCardClick = useCallback(() => {
        navigate(RoutePath.event + event?.id);
    }, [event?.id, navigate]);

    if (isLoading) {
        return (
            <HStack
                gap="24px"
                align="start"
                justify="start"
                maxW
                className="rounded-xl outline outline-2 outline-card-bg p-4"
            >
                <Skeleton width="75px" height="75px" rounded={12} />
                <VStack maxW gap="8px">
                    <Skeleton width="33%" height="22px" rounded={8} />

                    <VStack maxW>
                        <Skeleton width="75%" height="10px" rounded={2} />
                        <Skeleton width="75%" height="10px" rounded={2} />
                        <Skeleton width="75%" height="10px" rounded={2} />
                        <Skeleton width="50%" height="10px" rounded={2} />
                    </VStack>
                </VStack>
            </HStack>
        );
    }

    return (
        <button
            onClick={handleEventCardClick}
            type="button"
            className="w-full rounded-xl border-2 border-card-bg p-4 hover:bg-card-bg duration-200"
        >
            <HStack gap="24px" align="start" justify="start" maxW>
                <Image
                    fallbackSrc={`/static/events-types/${event?.type}-fallback.webp`}
                    src={`${import.meta.env.VITE_MINIO_ENDPOINT}/events_bucket/${event?.image}`}
                    width={75}
                    height={75}
                    classNames={{
                        wrapper: classes.img,
                    }}
                    alt={`Image ${event?.title}`}
                />

                <HStack maxW align="start">
                    <VStack maxW gap="0">
                        <h2 className="text-m md:text-l font-bold">{event?.title}</h2>
                        <p className="text-xs md:text-m leading-none italic">
                            {event?.shortDescription}
                        </p>
                    </VStack>

                    <VStack className="w-1/5" gap="4px">
                        <p className="text-xs md:text-m leading-none italic opacity-60">
                            {renderDates}
                        </p>
                        <p className="text-xs md:text-m leading-none italic opacity-60">
                            {isMobile ? 'рег-ия ' : 'регистрация '}до {renderRegisterDate}
                        </p>
                    </VStack>
                </HStack>
            </HStack>
        </button>
    );
};
