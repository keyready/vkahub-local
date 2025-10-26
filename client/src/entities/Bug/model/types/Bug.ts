export enum BugStatus {
    OPENED = 'opened',
    CLOSED = 'closed',
    PROGRESS = 'in_progress',
}

export interface Bug {
    id: number;
    description: string;
    produce: string;
    author: string;
    expected: string;
    media: string[];
    additional: string;
    status: BugStatus;
    createdAt: Date;
}
