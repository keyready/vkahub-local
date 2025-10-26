import { Track } from '../model/types/Track';

import { rtkApi } from '@/shared/api/rtkApi';

const fetchEventsApi = rtkApi.injectEndpoints({
    endpoints: (build) => ({
        getEventTracks: build.query<Track[], number>({
            query: (eventId) => ({
                url: `/api/events/tracks?eventId=${eventId}`,
            }),
        }),
    }),
});

export const useEventTracks = fetchEventsApi.useGetEventTracksQuery;
