import { User } from '@/entities/User';

export interface Message {
    id: number;
    author: Pick<User, 'avatar' | 'username'>;
    message: string;
    teamChatId: number;
    attachments?: string[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
