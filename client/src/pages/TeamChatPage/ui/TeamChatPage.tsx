import { memo, useEffect } from 'react';
import { BreadcrumbItem, Breadcrumbs, Divider, Image } from '@nextui-org/react';
import { Navigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import classes from './TeamChatPage.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { Page } from '@/widgets/Page';
import { RoutePath } from '@/shared/config/routeConfig';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { fetchTeam, getTeamData, TeamReducer } from '@/entities/Team';
import { DynamicModuleLoader } from '@/shared/lib/DynamicModuleLoader';
import { useTeamMembers } from '@/entities/Team/api/fetchTeamsApi';
import { Skeleton } from '@/shared/ui/Skeleton';
import { HStack, VStack } from '@/shared/ui/Stack';
import { ChatWindow } from '@/features/Telegram';
import { AppLink } from '@/shared/ui/AppLink';
import { getUserData } from '@/entities/User';
import { useWindowWidth } from '@/shared/lib/hooks/useWindowWidth';

interface TeamChatPageProps {
    className?: string;
}

const TeamChatPage = memo((props: TeamChatPageProps) => {
    const { className } = props;

    useEffect(() => {
        document.title = 'Командный чат';
    }, []);

    const { isMobile } = useWindowWidth();

    const { teamId } = useParams<{ teamId: string }>();
    const { data: teamMembers, isLoading: isTeamMembersLoading } = useTeamMembers(Number(teamId));

    const dispatch = useAppDispatch();

    const teamData = useSelector(getTeamData);
    const userData = useSelector(getUserData);

    useEffect(() => {
        if (teamId) {
            dispatch(fetchTeam(teamId));
        }
    }, [dispatch, teamId]);

    if (userData?.id && teamData?.members?.length && !teamData?.members.includes(userData?.id)) {
        return <Navigate to={`${RoutePath.feed}?tab=team`} />;
    }

    if (isTeamMembersLoading) {
        return (
            <DynamicModuleLoader reducers={{ team: TeamReducer }}>
                <Page className={classNames(classes.TeamChatPage, {}, [className])}>
                    <Breadcrumbs
                        itemClasses={{
                            item: 'data-[current=true]:text-accent',
                        }}
                    >
                        <BreadcrumbItem href={RoutePath.main}>Главная</BreadcrumbItem>
                        <BreadcrumbItem href={RoutePath.teams}>Все команды</BreadcrumbItem>
                        <BreadcrumbItem href={`${RoutePath.team + teamId}/${teamData?.title}`}>
                            {teamData?.title}
                        </BreadcrumbItem>
                        <BreadcrumbItem href={`${RoutePath.teammessenger + teamId}/messenger`}>
                            Чат с участниками
                        </BreadcrumbItem>
                    </Breadcrumbs>

                    <h1 className="mt-4 w-full text-center text-2xl font-bold">
                        {teamData?.title} | Командный чат
                    </h1>

                    <Skeleton width="100%" height={100} />
                </Page>
            </DynamicModuleLoader>
        );
    }

    return (
        <DynamicModuleLoader reducers={{ team: TeamReducer }}>
            <Page className={classNames(classes.TeamChatPage, {}, [className])}>
                <Breadcrumbs
                    itemClasses={{
                        item: 'data-[current=true]:text-accent',
                    }}
                >
                    <BreadcrumbItem href={RoutePath.main}>Главная</BreadcrumbItem>
                    <BreadcrumbItem href={RoutePath.teams}>Все команды</BreadcrumbItem>
                    <BreadcrumbItem href={`${RoutePath.team + teamId}/${teamData?.title}`}>
                        {teamData?.title}
                    </BreadcrumbItem>
                    <BreadcrumbItem href={`${RoutePath.teammessenger + teamId}/messenger`}>
                        Чат с участниками
                    </BreadcrumbItem>
                </Breadcrumbs>

                <HStack maxW align="start" gap="24px" className="mt-10">
                    {!isMobile && (
                        <VStack gap="8px" className="w-1/3">
                            <h1 className="font-bold text-l mb-4">Участники чата:</h1>
                            {teamMembers?.length ? (
                                teamMembers.map((teamMember, index) => (
                                    <AppLink
                                        target="_blank"
                                        className="w-full"
                                        to={RoutePath.member + teamMember.username}
                                    >
                                        <HStack maxW align="center" gap="8px">
                                            <Image
                                                width={50}
                                                height={50}
                                                classNames={{ wrapper: classes.avatarFallback }}
                                                fallbackSrc="/static/fallbacks/user-fallback.webp"
                                                src={`https://storage.yandexcloud.net/vkahub-storage/${teamMember.avatar}`}
                                                alt={teamMember.username}
                                            />
                                            <h1>{teamMember.username}</h1>
                                        </HStack>
                                        {index !== teamMembers.length - 1 && (
                                            <Divider className="mt-2 " />
                                        )}
                                    </AppLink>
                                ))
                            ) : (
                                <p>Нет участников в команде</p>
                            )}
                        </VStack>
                    )}

                    <ChatWindow />
                </HStack>
            </Page>
        </DynamicModuleLoader>
    );
});

export default TeamChatPage;
