import { Event, EventType } from '../model/types/Event';

import { rtkApi } from '@/shared/api/rtkApi';

const fetchEventsApi = rtkApi.injectEndpoints({
    endpoints: (build) => ({
        getEvents: build.query<Event[], EventType>({
            query: (type) => ({
                url: `/api/events?type=${type}`,
            }),
        }),
    }),
});

export const useEvents = fetchEventsApi.useGetEventsQuery;
