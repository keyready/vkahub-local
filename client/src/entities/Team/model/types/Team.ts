import { ImageObj } from '@/shared/ui/Image';

export interface Team {
    id: string;

    title: string;
    description: string;
    image: ImageObj;
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
