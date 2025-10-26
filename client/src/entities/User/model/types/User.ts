export type AuthErrorTypes =
    | 'Username not found'
    | 'Invalid password'
    | 'User with this username or mail already exists';

export interface Tokens {
    access_token: string;
    refresh_token: string;
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

export interface ServerUser {
    id: string;

    mail: string;
    username: string;
    password: string;
    avatar: string;
    roles: UserRoles[];

    firstname: string;
    lastname: string;
    middlename: string;
    description: string;

    group_number: string;
    rank: string;

    teamId: number;
    skills: string[];
    positions: string[];
    created_at: Date;
    lastOnline: Date;
}

export type User = Partial<ServerUser>;
