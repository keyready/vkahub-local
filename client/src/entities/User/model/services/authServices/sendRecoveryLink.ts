import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

import { ThunkConfig } from '@/app/providers/StoreProvider/config/StateSchema';

export const sendRecoveryLink = createAsyncThunk<{ question: string }, string, ThunkConfig<string>>(
    'User/sendRecoveryLink',
    async (mail, thunkAPI) => {
        const { extra, rejectWithValue } = thunkAPI;

        try {
            const response = await extra.api.post<{ question: string }>(
                '/api/auth/personal_question',
                {
                    username: mail,
                },
            );

            if (!response.data) {
                throw new Error();
            }

            return response.data;
        } catch (e) {
            const axiosError = e as AxiosError;
            return rejectWithValue(
                // @ts-ignore
                { status: axiosError.response.status, message: axiosError.response?.data?.error } ||
                    'Произошла ошибка',
            );
        }
    },
);
