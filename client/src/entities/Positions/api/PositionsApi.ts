import { Position } from '../model/types/Position';

import { rtkApi } from '@/shared/api/rtkApi';

interface PositionsResponse {
    ID: number; Name: string; Author: string;
}

const fetchPositionsApi = rtkApi.injectEndpoints({
    endpoints: (build) => ({
        fetchAllPositions: build.query<Position[], void>({
            query: () => ({
                url: `/api/positions`,
            }),
            transformResponse: (response: PositionsResponse[]) =>
                response.map((serverPositions) => ({
                    id: serverPositions.ID,
                    title: serverPositions.Name,
                    author: serverPositions.Author,
                })),
        }),
    }),
});

export const usePositions = fetchPositionsApi.useFetchAllPositionsQuery;
