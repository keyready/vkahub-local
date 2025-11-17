export interface Team {
    id: string;

    title: string;
    description: string;
    image: string;
    newImage?: File;

    captain_id: string;
    members: number[];
    eventLocation: string;

    wantedPositions: string[];
}

export interface TeamsFilters {
    title?: string;
    members: number[];
    wanted?: string;
}
