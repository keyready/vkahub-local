import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

import { Achievement } from '../types/Achievement';

import { ThunkConfig } from '@/app/providers/StoreProvider/config/StateSchema';

export const fetchAchievement = createAsyncThunk<Achievement, string, ThunkConfig<string>>(
    'Achievement/fetchAchievement',
    async (AchievementId, thunkAPI) => {
        const { extra, rejectWithValue } = thunkAPI;

        try {
            const response = await extra.api.get<Achievement>('/url');

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
