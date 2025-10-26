import { memo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BreadcrumbItem, Breadcrumbs } from '@nextui-org/react';

import classes from './DetailedTeamPage.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { Page } from '@/widgets/Page';
import { RoutePath } from '@/shared/config/routeConfig';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import {
    fetchTeam,
    getTeamData,
    getTeamIsLoading,
    TeamInfoBlock,
    TeamReducer,
} from '@/entities/Team';
import { DynamicModuleLoader } from '@/shared/lib/DynamicModuleLoader';
import { VStack } from '@/shared/ui/Stack';
import { AppLink } from '@/shared/ui/AppLink';
import { Helmet } from '@/widgets/Helmet';

interface DetailedTeamPageProps {
    className?: string;
}

const DetailedTeamPage = memo((props: DetailedTeamPageProps) => {
    const { className } = props;

    const { teamTitle, teamId } = useParams<{ teamTitle: string; teamId: string }>();

    const dispatch = useAppDispatch();

    const isTeamLoading = useSelector(getTeamIsLoading);
    const team = useSelector(getTeamData);

    useEffect(() => {
        if (teamId) {
            dispatch(fetchTeam(teamId));
        }
    }, [dispatch, teamId]);

    useEffect(() => {
        document.title = 'Загрузка...';
    }, []);

    if (!isTeamLoading && !team?.id) {
        document.title = 'Команда не найдена';

        return (
            <DynamicModuleLoader reducers={{ team: TeamReducer }}>
                <Page className="flex">
                    <VStack gap="14px" flexGrow align="center" justify="center" maxW>
                        <h1 className="text-2xl italic w-full text-center">
                            Информация о команде не получена
                        </h1>
                        <AppLink className="text-l" to={RoutePath.teams}>
                            Вернуться к списку команд
                        </AppLink>
                    </VStack>
                </Page>
            </DynamicModuleLoader>
        );
    }

    return (
        <DynamicModuleLoader reducers={{ team: TeamReducer }}>
            <Helmet
                title={`${team?.title} | Команда`}
                description={`Детальная информация о ${team?.title}. Просмотрите состав команды, текущие проекты и достижения.`}
            />

            <Page className={classNames(classes.DetailedTeamPage, {}, [className])}>
                <Breadcrumbs
                    itemClasses={{
                        item: 'data-[current=true]:text-accent',
                    }}
                >
                    <BreadcrumbItem href={RoutePath.main}>Главная</BreadcrumbItem>
                    <BreadcrumbItem href={RoutePath.teams}>Все команды</BreadcrumbItem>
                    <BreadcrumbItem href={RoutePath.team + team?.id}>{team?.title}</BreadcrumbItem>
                </Breadcrumbs>

                <TeamInfoBlock isLoading={isTeamLoading} team={team} />
            </Page>
        </DynamicModuleLoader>
    );
});

export default DetailedTeamPage;
