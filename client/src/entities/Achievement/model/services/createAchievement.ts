import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

import { ResultType } from '../types/Achievement';

import { ThunkConfig } from '@/app/providers/StoreProvider/config/StateSchema';

interface CreateAchievementProps {
    teamId: number;
    eventId: number;
    result: ResultType;
}

export const createAchievement = createAsyncThunk<
    string,
    CreateAchievementProps,
    ThunkConfig<string>
>('Achievement/createAchievement', async (props, thunkAPI) => {
    const { extra, rejectWithValue } = thunkAPI;

    try {
        const response = await extra.api.post<string>('/api/achievements/create', props);

        if (!response.data) {
            throw new Error();
        }

        return response.data;
    } catch (e) {
        const axiosError = e as AxiosError;
        // @ts-ignore
        return rejectWithValue(axiosError.response?.data?.message || 'Произошла ошибка');
    }
});
