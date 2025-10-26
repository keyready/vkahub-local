import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { USER_ACCESS_TOKEN } from '@/shared/const';

export const rtkApi = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: '',
        prepareHeaders: (headers: Headers) => {
            const token = localStorage.getItem(USER_ACCESS_TOKEN) || '';

            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }

            return headers;
        },
    }),
    endpoints: (builder) => ({}),
});
