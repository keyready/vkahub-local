import { StateSchema } from '@/app/providers/StoreProvider';

export const getProposalData = (state: StateSchema) => state.proposal?.data;
export const getProposalIsLoading = (state: StateSchema) => state.proposal?.isLoading;
export const getProposalError = (state: StateSchema) => state.proposal?.error;
