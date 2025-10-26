import { Achievement } from './Achievement';

export interface AchievementSchema {
    data?: Achievement;
    isLoading: boolean;
    error?: string;
}
