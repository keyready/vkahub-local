import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

import { Event } from '../types/Event';

import { ThunkConfig } from '@/app/providers/StoreProvider/config/StateSchema';

export const fetchEvent = createAsyncThunk<Event, string, ThunkConfig<string>>(
    'Event/fetchEvent',
    async (eventId, thunkAPI) => {
        const { extra, rejectWithValue } = thunkAPI;

        try {
            const response = await extra.api.get<Event>(`/api/events/event?eventId=${eventId}`);

            if (!response.data) {
                throw new Error();
            }

            // FIXME replace with real data
            return {
                ...response.data,
                image: {
                    image: response.data.image as unknown as string,
                    hash: 'eA9jfh%2IAs:E1tRbbR*WpWB00Rjx]Rj%MIAiwxao1oz_NNGIoozRj',
                },
            } as Event;
        } catch (e) {
            const axiosError = e as AxiosError;
            // @ts-ignore
            return rejectWithValue(axiosError.response?.data?.message || 'Произошла ошибка');
        }
    },
);
