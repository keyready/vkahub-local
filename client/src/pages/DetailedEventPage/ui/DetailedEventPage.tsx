import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { BreadcrumbItem, Breadcrumbs } from '@nextui-org/react';

import classes from './DetailedEventPage.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { Page } from '@/widgets/Page';
import { RoutePath } from '@/shared/config/routeConfig';
import { Helmet } from '@/widgets/Helmet';
import { DynamicModuleLoader } from '@/shared/lib/DynamicModuleLoader';
import { EventInfoBlock, EventReducer, getEventData, getIsEventLoading } from '@/entities/Event';
import { fetchEvent } from '@/entities/Event/model/services/fetchEvent';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { VStack } from '@/shared/ui/Stack';
import { AppLink } from '@/shared/ui/AppLink';

interface DetailedEventPageProps {
    className?: string;
}

const DetailedEventPage = (props: DetailedEventPageProps) => {
    const { className } = props;

    const { eventId } = useParams<{ eventId: string }>();

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const event = useSelector(getEventData);
    const isEventLoading = useSelector(getIsEventLoading);

    useEffect(() => {
        if (eventId) {
            dispatch(fetchEvent(eventId));
        }
    }, [dispatch, eventId]);

    const renderPageTitle = useMemo(() => {
        if (!event) return 'Событие не найдено';

        switch (event?.type) {
            case 'ctf':
                return 'CTF';
            case 'hack':
                return 'Хакатоны';
            default:
                return 'Прочие события';
        }
    }, [event]);

    if (!eventId) {
        return <Navigate to={RoutePath.events} />;
    }

    if (!event && !isEventLoading) {
        return (
            <DynamicModuleLoader reducers={{ event: EventReducer }}>
                <Helmet title="Событие не найдено" description="" />
                <Page className="flex">
                    <VStack gap="14px" flexGrow align="center" justify="center" maxW>
                        <h1 className="text-2xl italic w-full text-center">
                            Информация о событии не получена
                        </h1>
                        <AppLink className="text-l" to={RoutePath.events}>
                            Вернуться к списку событий
                        </AppLink>
                    </VStack>
                </Page>
            </DynamicModuleLoader>
        );
    }

    return (
        <DynamicModuleLoader reducers={{ event: EventReducer }}>
            <Helmet
                title={event?.title || ''}
                description={`Детальная информация о ${event?.title}. Просмотрите даты проведения, подробную информаци, треки и прочую информацию`}
            />
            <Page className={classNames(classes.DetailedEventPage, {}, [className])}>
                <Breadcrumbs
                    itemClasses={{
                        item: 'data-[current=true]:text-accent',
                    }}
                >
                    <BreadcrumbItem href={RoutePath.main}>Главная</BreadcrumbItem>
                    <BreadcrumbItem href={RoutePath.events}>Все события</BreadcrumbItem>
                    <BreadcrumbItem href={`${RoutePath.events}?category=${event?.type}`}>
                        {renderPageTitle}
                    </BreadcrumbItem>
                    <BreadcrumbItem href={RoutePath.event + event?.id}>
                        {event?.title}
                    </BreadcrumbItem>
                </Breadcrumbs>

                <EventInfoBlock isLoading={isEventLoading} event={event} />
            </Page>
        </DynamicModuleLoader>
    );
};

export default DetailedEventPage;
