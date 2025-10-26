import { useEffect, useMemo, useState } from 'react';
import { BreadcrumbItem, Breadcrumbs } from '@nextui-org/react';

import classes from './EventsPage.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { Page } from '@/widgets/Page';
import { EventsList, EventsTypeGrid, EventType } from '@/entities/Event';
import { useParams } from '@/shared/lib/hooks/useParams';
import { RoutePath } from '@/shared/config/routeConfig';
import { Helmet } from '@/widgets/Helmet';
import { HStack } from '@/shared/ui/Stack';

interface EventsPageProps {
    className?: string;
}

const EventsPage = (props: EventsPageProps) => {
    const { className } = props;

    const { getParamValue } = useParams();

    const [selectedEventCategory, setSelectedEventCategory] = useState<EventType | undefined>();

    const renderPageTitle = useMemo(() => {
        switch (selectedEventCategory) {
            case 'ctf':
                return 'CTF';
            case 'hack':
                return 'Хакатоны';
            case 'other':
                return 'Прочие события';
            default:
                return 'События';
        }
    }, [selectedEventCategory]);

    useEffect(() => {
        const category = getParamValue('category');
        if (category) {
            setSelectedEventCategory(category as EventType);
        } else {
            setSelectedEventCategory(undefined);
        }
    }, [getParamValue]);

    return (
        <Page className={classNames(classes.EventsPage, {}, [className])}>
            <Helmet title={renderPageTitle} description="Все события нашего сообщества" />

            <Breadcrumbs
                itemClasses={{
                    item: 'data-[current=true]:text-accent',
                }}
            >
                <BreadcrumbItem href={RoutePath.main}>Главная</BreadcrumbItem>
                <BreadcrumbItem href={RoutePath.events}>Все события</BreadcrumbItem>
                {selectedEventCategory && (
                    <BreadcrumbItem href={RoutePath.events + selectedEventCategory}>
                        {renderPageTitle}
                    </BreadcrumbItem>
                )}
            </Breadcrumbs>

            <h1 className="mt-2 w-full text-center text-xl md:text-2xl font-bold">
                {renderPageTitle}
            </h1>

            <EventsTypeGrid
                selectedCategory={selectedEventCategory}
                setSelectedCategory={setSelectedEventCategory}
            />
            {selectedEventCategory && (
                <HStack align="start" gap="24px" maxW className="relative">
                    <EventsList
                        selectedCategory={selectedEventCategory}
                        setSelectedEventCategory={setSelectedEventCategory}
                    />
                </HStack>
            )}
        </Page>
    );
};

export default EventsPage;
