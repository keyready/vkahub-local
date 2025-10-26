import { StateSchema } from '@/app/providers/StoreProvider';

export const getMessageIsLoading = (state: StateSchema) => state.message?.isLoading;
export const getMessageError = (state: StateSchema) => state.message?.error;
