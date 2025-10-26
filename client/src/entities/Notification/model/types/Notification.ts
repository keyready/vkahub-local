export enum NotificationStatus {
    NEW = 'new',
    SEEN = 'read',
}

export interface Notification {
    id: number;
    ownerId: number;
    message: string;
    createdAt: Date;
    status: NotificationStatus;
}
