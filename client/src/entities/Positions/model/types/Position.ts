export interface Position {
    id: number;
    title: string;
    author?: string;
}

export interface PositionSchema {
    data?: Position;
    isLoading: boolean;
    error?: string;
}
