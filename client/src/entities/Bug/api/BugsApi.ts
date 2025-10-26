import { Bug } from '../model/types/Bug';

import { rtkApi } from '@/shared/api/rtkApi';

const fetchBugsApi = rtkApi.injectEndpoints({
    endpoints: (build) => ({
        getAllBugs: build.query<Bug[], string>({
            query: (type) => ({
                url: `/api/bugs?status=${type}`,
            }),
        }),
    }),
});

export const useBugs = fetchBugsApi.useGetAllBugsQuery;
