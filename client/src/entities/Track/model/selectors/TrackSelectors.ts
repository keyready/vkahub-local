import { StateSchema } from '@/app/providers/StoreProvider';

export const getTrackIsLoading = (state: StateSchema) => state.track?.isLoading;
export const getTrackError = (state: StateSchema) => state.track?.error;
