import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

import { Tokens, User } from '../../types/User';

import { ThunkConfig } from '@/app/providers/StoreProvider/config/StateSchema';
import { USER_ACCESS_TOKEN, USER_REFRESH_TOKEN } from '@/shared/const';

interface TokensResponse {
    data: Tokens;
    message: string;
    status: number;
}

export const loginUser = createAsyncThunk<Tokens, User, ThunkConfig<string>>(
    'User/loginUser',
    async (newUser, thunkAPI) => {
        const { extra, rejectWithValue } = thunkAPI;

        try {
            const response = await extra.api.post<Tokens>('/api/auth/login', newUser);

            if (response.status > 300) {
                throw new Error();
            }

            localStorage.setItem(USER_ACCESS_TOKEN, response.data.access_token);
            localStorage.setItem(USER_REFRESH_TOKEN, response.data.refresh_token);

            return response.data;
        } catch (e) {
            const axiosError = e as AxiosError;
            // @ts-ignore
            return rejectWithValue(axiosError.response?.data?.error || 'Произошла ошибка');
        }
    },
);
