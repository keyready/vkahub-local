import { Proposal } from './Proposal';

export interface ProposalSchema {
    data?: Proposal;
    isLoading: boolean;
    error?: string;
}
