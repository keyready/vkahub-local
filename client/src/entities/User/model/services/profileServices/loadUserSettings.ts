import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

import { UserSettings } from '../../types/User';

import { ThunkConfig } from '@/app/providers/StoreProvider/config/StateSchema';

export const loadUserSettings = createAsyncThunk<UserSettings, string, ThunkConfig<string>>(
    'User/loadUserSettings',
    async (username, thunkAPI) => {
        const { extra, rejectWithValue } = thunkAPI;

        try {
            const response = await extra.api.get<UserSettings>(`/api/user/setting`);

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
