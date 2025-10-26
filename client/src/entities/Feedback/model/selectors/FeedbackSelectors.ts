import { StateSchema } from '@/app/providers/StoreProvider';

export const getIsFeedbackCreating = (state: StateSchema) => state.feedback?.isLoading;
