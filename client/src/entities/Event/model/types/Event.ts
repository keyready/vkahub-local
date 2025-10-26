export type EventType = 'ctf' | 'hack' | 'other' | 'all' | 'old';

export interface Event {
    id: number;
    title: string;
    description: string;
    shortDescription: string;
    sponsors: string[];
    image?: string;
    type: EventType;

    // Даты проведения и регистрации
    startDate: Date;
    finishDate: Date;
    registerUntil: Date;

    // треки
    tracksId?: number[];
    participantsTeamsIds?: number[];
}
