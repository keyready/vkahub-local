export type { Proposal, ProposalType } from './model/types/Proposal';
export type { ProposalSchema } from './model/types/ProposalSchema';

export { ProposalActions, ProposalReducer } from './model/slice/ProposalSlice';
export {
    getProposalData,
    getProposalIsLoading,
    getProposalError,
} from './model/selectors/ProposalSelectors';
export { useProposals } from './api/getProposalsApi';

export { createProposal } from './model/service/createProposal';

export { ProposalsBlock } from './ui/ProposalsBlock/ProposalsBlock';
export { ProposalsList } from './ui/ProposalsList/ProposalsList';
