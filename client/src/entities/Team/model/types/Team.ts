export interface Team {
    id: number;

    title: string;
    description: string;
    image: string;

    captain_id: number;
    members: number[];
    eventLocation: string;

    wantedPositions: string[];
}

export interface TeamsFilters {
    title?: string;
    members: number[];
    wanted?: string;
}
