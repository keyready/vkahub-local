import { EventType } from '@/entities/Event';

export type ResultType = 'first' | 'second' | 'third' | 'participant';

export interface Achievement {
    id: number;

    teamId: number;
    userId: number;

    eventName: string;
    eventType: EventType;
    teamTitle: string;
    eventId: number;
    trackId?: number;

    result: ResultType;
}
