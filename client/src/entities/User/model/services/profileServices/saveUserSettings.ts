import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

import { UserSettings } from '../../types/User';

import { ThunkConfig } from '@/app/providers/StoreProvider/config/StateSchema';
import { USER_SETTINGS } from '@/shared/const';

export const saveUserSettings = createAsyncThunk<string, UserSettings, ThunkConfig<string>>(
    'User/saveUserSettings',
    async (settings, thunkAPI) => {
        const { extra, rejectWithValue } = thunkAPI;

        localStorage.setItem(USER_SETTINGS, JSON.stringify(settings));

        try {
            const response = await extra.api.post<string>(`/api/user/setting`, settings);

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
