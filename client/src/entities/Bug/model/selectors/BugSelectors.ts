import { StateSchema } from '@/app/providers/StoreProvider';

export const getIsBugCreating = (state: StateSchema) => state.bug?.isLoading;
