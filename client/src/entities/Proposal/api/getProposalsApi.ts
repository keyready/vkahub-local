import { Proposal, ProposalType } from '../model/types/Proposal';

import { rtkApi } from '@/shared/api/rtkApi';

const fetchProposalsApi = rtkApi.injectEndpoints({
    endpoints: (build) => ({
        getProposals: build.query<Proposal[], ProposalType>({
            query: (type) => ({
                url: `/api/proposal?type=${type}`,
            }),
        }),
    }),
});

export const useProposals = fetchProposalsApi.useGetProposalsQuery;
