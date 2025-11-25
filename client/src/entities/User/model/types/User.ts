export type AuthErrorTypes =
    | 'Username not found'
    | 'Invalid password'
    | 'User with this username or mail already exists';

export interface Tokens {
    access_token: string;
    refresh_token: string;
}

export type EventPlace = '1st' | '2nd' | '3rd' | 'participant';

export const eventPlace: { key: EventPlace; label: string }[] = [
    { key: '1st', label: 'Первое место' },
    { key: '2nd', label: 'Второе место' },
    { key: '3rd', label: 'Третье место' },
    { key: 'participant', label: 'Участник' },
];

export interface PortfolioFile {
    name: string;
    eventName: string;
    place: EventPlace;
    url: string;
    type: 'img' | 'pdf';
}

export enum UserRoles {
    ADMIN = 'admin',
    USER = 'user',
    MAIL_CONFIRMED = 'mailConfirmed',
    PROFILE_CONFIRMED = 'profileConfirmed',
    BANNED = 'banned',
}

export interface MembersFilters {
    lastname?: string;
    username?: string;
    wanted?: string;
    isMember?: boolean;
    skills?: string[];
}

export interface RecoveryQuestion {
    id: number;
    question: string;
}

export interface ServerUser {
    id: string;

    mail: string;
    username: string;
    password: string;
    avatar: string;
    newAvatar?: File;
    roles: UserRoles[];
    portfolio?: PortfolioFile[];

    firstname: string;
    lastname: string;
    middlename: string;
    description: string;

    // recovery
    recovery: {
        question: string;
        answer: string;
    };

    group_number: string;
    rank: string;

    teamId: number;
    skills: string[];
    positions: string[];
    created_at: Date;
    lastOnline: Date;
}

export type User = Partial<ServerUser>;
