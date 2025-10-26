import { RouteProps } from 'react-router-dom';

import { MainPage } from '@/pages/MainPage';
import { NotFound } from '@/pages/NotFound';
import { TeamsPage } from '@/pages/TeamsPage';
import { MembersPage } from '@/pages/MembersPage';
import { FeedPage } from '@/pages/FeedPage';
import { LoginPage } from '@/pages/LoginPage';
import { DetailedTeamPage } from '@/pages/DetailedTeamPage';
import { WhatsNewPage } from '@/pages/WhatsNewPage';
import { DetailedMemberPage } from '@/pages/DetailedMemberPage';
import { RecoveryPage } from '@/pages/RecoveryPage';
import { EmailConfirmationPage } from '@/pages/EmailConfirmationPage';
import { ProfileAchievementsPage } from '@/pages/ProfileAchievementsPage';
import { EventsPage } from '@/pages/EventsPage';
import { DetailedEventPage } from '@/pages/DetailedEventPage';
import { AdminPage } from '@/pages/AdminPage';
import { FeedbackPage } from '@/pages/FeedbackPage';
import { UserRoles } from '@/entities/User';
import { BannedPage } from '@/pages/BannedPage';
import { CommunityRulesPage } from '@/pages/CommunityRulesPage';
import { TeamChatPage } from '@/pages/TeamChatPage';

export type AppRoutesProps = RouteProps & {
    authOnly?: boolean;
    roles?: UserRoles[];
};

export enum AppRoutes {
    LOGIN = 'login',
    RECOVERY = 'recovery',
    CONFIRMATION = 'confirmation',
    CHANGELOGS = 'changelogs',
    RULES = 'rules',

    MAIN = 'main',
    TEAM = 'team',
    TEAMS = 'teams',
    TEAMMESSENGER = 'teammessenger',
    MEMBER = 'member',
    MEMBERS = 'members',
    EVENT = 'event',
    EVENTS = 'events',
    FEED = 'feed',
    ADMIN = 'admin',
    PROFILEACHIEVEMENTS = 'achievements',
    FEEDBACK = 'feedback',
    BANNED = 'banned',

    // last
    NOT_FOUND = 'not_found',
}

export const RoutePath: Record<AppRoutes, string> = {
    [AppRoutes.LOGIN]: '/login',
    [AppRoutes.RECOVERY]: '/recovery',
    [AppRoutes.CHANGELOGS]: '/whats-new',
    [AppRoutes.CONFIRMATION]: '/confirm_email',
    [AppRoutes.BANNED]: '/oops',
    [AppRoutes.RULES]: '/rules',

    [AppRoutes.MAIN]: '/',
    [AppRoutes.EVENT]: '/events/',
    [AppRoutes.EVENTS]: '/events',
    [AppRoutes.TEAMMESSENGER]: '/teams/',
    [AppRoutes.TEAM]: '/teams/',
    [AppRoutes.TEAMS]: '/teams',
    [AppRoutes.MEMBER]: '/members/',
    [AppRoutes.MEMBERS]: '/members',
    [AppRoutes.PROFILEACHIEVEMENTS]: '/feed/achievements',
    [AppRoutes.FEED]: '/feed',
    [AppRoutes.FEEDBACK]: '/feedback',

    [AppRoutes.ADMIN]: '/admin-panel',

    // last
    [AppRoutes.NOT_FOUND]: '*',
};

export const routerConfig: Record<AppRoutes, AppRoutesProps> = {
    // авторизация
    [AppRoutes.LOGIN]: {
        path: RoutePath.login,
        element: <LoginPage />,
    },
    [AppRoutes.RECOVERY]: {
        path: RoutePath.recovery,
        element: <RecoveryPage />,
    },
    [AppRoutes.CHANGELOGS]: {
        path: RoutePath.changelogs,
        element: <WhatsNewPage />,
    },
    [AppRoutes.CONFIRMATION]: {
        path: RoutePath.confirmation,
        element: <EmailConfirmationPage />,
    },
    [AppRoutes.RULES]: {
        path: RoutePath.rules,
        element: <CommunityRulesPage />,
    },

    // закрытые роуты
    [AppRoutes.BANNED]: {
        path: RoutePath.banned,
        element: <BannedPage />,
        authOnly: true,
        roles: [UserRoles.BANNED],
    },
    [AppRoutes.MAIN]: {
        path: RoutePath.main,
        element: <MainPage />,
        authOnly: true,
    },
    [AppRoutes.TEAMMESSENGER]: {
        path: `${RoutePath.teammessenger}:teamId/messenger/`,
        element: <TeamChatPage />,
        authOnly: true,
        roles: [UserRoles.MAIL_CONFIRMED, UserRoles.PROFILE_CONFIRMED],
    },
    [AppRoutes.TEAM]: {
        path: `${RoutePath.team}:teamId/:teamTitle`,
        element: <DetailedTeamPage />,
        authOnly: true,
        roles: [UserRoles.MAIL_CONFIRMED, UserRoles.PROFILE_CONFIRMED],
    },
    [AppRoutes.TEAMS]: {
        path: RoutePath.teams,
        element: <TeamsPage />,
        authOnly: true,
        roles: [UserRoles.MAIL_CONFIRMED, UserRoles.PROFILE_CONFIRMED],
    },
    [AppRoutes.EVENT]: {
        path: `${RoutePath.event}:eventId`,
        element: <DetailedEventPage />,
        authOnly: true,
        roles: [UserRoles.MAIL_CONFIRMED, UserRoles.PROFILE_CONFIRMED],
    },
    [AppRoutes.EVENTS]: {
        path: RoutePath.events,
        element: <EventsPage />,
        authOnly: true,
        roles: [UserRoles.MAIL_CONFIRMED, UserRoles.PROFILE_CONFIRMED],
    },
    [AppRoutes.MEMBER]: {
        path: `${RoutePath.member}:username`,
        element: <DetailedMemberPage />,
        authOnly: true,
        roles: [UserRoles.MAIL_CONFIRMED, UserRoles.PROFILE_CONFIRMED],
    },
    [AppRoutes.MEMBERS]: {
        path: RoutePath.members,
        element: <MembersPage />,
        authOnly: true,
        roles: [UserRoles.MAIL_CONFIRMED, UserRoles.PROFILE_CONFIRMED],
    },
    [AppRoutes.FEED]: {
        path: RoutePath.feed,
        element: <FeedPage />,
        authOnly: true,
    },
    [AppRoutes.FEEDBACK]: {
        path: RoutePath.feedback,
        element: <FeedbackPage />,
        authOnly: true,
        roles: [UserRoles.USER],
    },
    [AppRoutes.ADMIN]: {
        path: RoutePath.admin,
        element: <AdminPage />,
        authOnly: true,
        roles: [UserRoles.ADMIN],
    },
    [AppRoutes.PROFILEACHIEVEMENTS]: {
        path: RoutePath.achievements,
        element: <ProfileAchievementsPage />,
        authOnly: true,
        roles: [UserRoles.PROFILE_CONFIRMED],
    },

    // last
    [AppRoutes.NOT_FOUND]: {
        path: RoutePath.not_found,
        element: <NotFound />,
    },
};
