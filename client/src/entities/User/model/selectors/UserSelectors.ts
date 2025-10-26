import { StateSchema } from '@/app/providers/StoreProvider';

export const getUserData = (state: StateSchema) => state.user?.data;
export const getSelectedProfileData = (state: StateSchema) => state.user?.selectedProfile;
export const getUserIsLoading = (state: StateSchema) => state.user?.isLoading;
export const getIsProfileChanging = (state: StateSchema) => state.user?.isProfileChanging;
export const getUserError = (state: StateSchema) => state.user?.error;
export const getUserAuthError = (state: StateSchema) => state.user?.authError;
export const getMembersFilters = (state: StateSchema) => state.user?.filters || {};
