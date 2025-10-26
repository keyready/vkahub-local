import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

import { BugStatus } from '../types/Bug';

import { ThunkConfig } from '@/app/providers/StoreProvider/config/StateSchema';

interface ChangeBugStatusProps {
    bugId: number;
    status: BugStatus;
}

export const changeBugStatus = createAsyncThunk<string, ChangeBugStatusProps, ThunkConfig<string>>(
    'Bug/changeBugStatus',
    async (newBug, thunkAPI) => {
        const { extra, rejectWithValue } = thunkAPI;

        try {
            const response = await extra.api.post<string>('/api/bugs/change-status', newBug);

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
