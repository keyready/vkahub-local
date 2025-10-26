import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

import { Track } from '../types/Track';

import { ThunkConfig } from '@/app/providers/StoreProvider/config/StateSchema';

export const createTrack = createAsyncThunk<string, Partial<Track>, ThunkConfig<string>>(
    'Track/createTrack',
    async (newTrack, thunkAPI) => {
        const { extra, rejectWithValue } = thunkAPI;

        try {
            const response = await extra.api.post<string>('/api/tracks/add', newTrack);

            if (!response.data) {
                throw new Error();
            }

            return response.data;
        } catch (e) {
            const axiosError = e as AxiosError;
            // @ts-ignore
            return rejectWithValue(axiosError.response?.data?.message || 'Произошла ошибка');
        }
    },
);
