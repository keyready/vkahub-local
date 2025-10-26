import { StateSchema } from '@/app/providers/StoreProvider';

export const getIsUpdateAvailable = (state: StateSchema) => state.serviceUpdated.isUpdateAvailable;
