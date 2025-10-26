import { useMemo } from 'react';

import { EventType } from '../../model/types/Event';
import { useEvents } from '../../api/fetchEventsApi';

import { classNames } from '@/shared/lib/classNames';
import { VStack } from '@/shared/ui/Stack';
import { EventCard } from '@/entities/Event/ui/EventCard/EventCard';
import { AppLink } from '@/shared/ui/AppLink';
import { RoutePath } from '@/shared/config/routeConfig';

interface EventsListProps {
    className?: string;
    selectedCategory: EventType;
    setSelectedEventCategory: (selectedEventCategory: EventType | undefined) => void;
}

export const EventsList = (props: EventsListProps) => {
    const { className, selectedCategory, setSelectedEventCategory } = props;

    const { data: events, isLoading } = useEvents(selectedCategory);

    const renderCategoryTitle = useMemo(() => {
        switch (selectedCategory) {
            case 'ctf': {
                return 'CTF';
            }
            case 'hack': {
                return 'хакатона';
            }
            default:
                return 'прочего мероприятия';
        }
    }, [selectedCategory]);

    if (isLoading) {
        return (
            <VStack
                gap="12px"
                maxW
                className={classNames('p-4 flex-grow overflow-y-auto w-full flex-wrap', {}, [
                    className,
                ])}
            >
                {new Array(11).fill(0).map((_, index) => (
                    <EventCard key={index} isLoading />
                ))}
            </VStack>
        );
    }

    if (!events?.length) {
        return (
            <VStack
                justify="start"
                align="center"
                maxW
                className={classNames('p-4 flex-grow w-full', {}, [className])}
            >
                <h1 className="w-full text-m md:text-l text-main italic text-center">
                    Модераторы пока не добавили ни одного {renderCategoryTitle}. Приходите позже
                </h1>
                <h1 className="text-s md:text-m text-main italic">
                    Вы можете написать модераторам с предложением добавить мероприятие на плафторму.
                    Для этого воспользуйтесь{' '}
                    <AppLink className="ttext-s md:ext-m" to={RoutePath.feedback}>
                        формой.
                    </AppLink>
                </h1>
            </VStack>
        );
    }

    return (
        <VStack
            gap="12px"
            maxW
            className={classNames('flex-grow overflow-y-auto w-full flex-wrap', {}, [className])}
        >
            {events
                .filter((event) => event.type === selectedCategory)
                .map((event, index) => (
                    <EventCard key={index} event={event} />
                ))}
        </VStack>
    );
};
