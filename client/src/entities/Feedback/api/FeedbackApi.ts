import { Feedback } from '../model/types/Feedback';

import { rtkApi } from '@/shared/api/rtkApi';

const fetchFeedbackApi = rtkApi.injectEndpoints({
    endpoints: (build) => ({
        getAllFeedback: build.query<Feedback[], void>({
            query: () => ({
                url: `/api/feedbacks`,
            }),
        }),
    }),
});

export const useFeedback = fetchFeedbackApi.useGetAllFeedbackQuery;
