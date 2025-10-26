import { StateSchema } from '@/app/providers/StoreProvider';

export const getIsNotificationLoading = (state: StateSchema) => state.notification?.isLoading;
