import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

import { ThunkConfig } from '@/app/providers/StoreProvider/config/StateSchema';

export const sendRecoveryLink = createAsyncThunk<string, string, ThunkConfig<string>>(
    'User/sendRecoveryLink',
    async (mail, thunkAPI) => {
        const { extra, rejectWithValue } = thunkAPI;

        try {
            const response = await extra.api.post<string>(
                '/api/users/recovery',
                {
                    mail,
                },
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        // 'Content-Type': 'multipart/form-data',
                    },
                },
            );

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
