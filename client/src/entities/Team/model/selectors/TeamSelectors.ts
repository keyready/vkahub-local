import { StateSchema } from '@/app/providers/StoreProvider';

export const getTeamData = (state: StateSchema) => state.team?.data;
export const getTeamIsLoading = (state: StateSchema) => state.team?.isLoading;
export const getInvitationIsLoading = (state: StateSchema) => state.team?.isInvitationLoading;
export const getTeamError = (state: StateSchema) => state.team?.error;
export const getTeamsFilters = (state: StateSchema) => state.team?.filters || { members: [1, 10] };
