import { StateSchema } from '@/app/providers/StoreProvider';

export const getAchievementData = (state: StateSchema) => state.achievement?.data;
export const getAchievementIsLoading = (state: StateSchema) => state.achievement?.isLoading;
export const getAchievementError = (state: StateSchema) => state.achievement?.error;
