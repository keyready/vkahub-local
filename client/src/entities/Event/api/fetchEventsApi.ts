import { Event, EventType } from '../model/types/Event';

import { rtkApi } from '@/shared/api/rtkApi';

const fetchEventsApi = rtkApi.injectEndpoints({
    endpoints: (build) => ({
        getEvents: build.query<Event[], EventType>({
            query: (type) => ({
                url: `/api/events?type=${type}`,
            }),

            // FIXME remove before production
            transformResponse: (events: Event[]) =>
                events.map((event) => ({
                    ...event,
                    image: {
                        image: event.image as unknown as string,
                        hash: 'eA9jfh%2IAs:E1tRbbR*WpWB00Rjx]Rj%MIAiwxao1oz_NNGIoozRj',
                    },
                })),
        }),
    }),
});

export const useEvents = fetchEventsApi.useGetEventsQuery;
