import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

import { User } from '../../types/User';

import { ThunkConfig } from '@/app/providers/StoreProvider/config/StateSchema';

export const getUserDataService = createAsyncThunk<User, void, ThunkConfig<string>>(
    'User/getUserData',
    async (_, thunkAPI) => {
        const { extra, rejectWithValue } = thunkAPI;

        try {
            const response = await extra.api.get<User>(`/api/get_user_data`);

            if (!response.data) {
                throw new Error();
            }

            // FIXME replace with real data
            return {
                ...response.data,
                avatar: {
                    image: response.data.avatar as unknown as string,
                    hash: 'UOGu5$tS7%x]$eWAE1WB0KRO,ARPIUt8aeoM',
                },
            } as User;
        } catch (e) {
            const axiosError = e as AxiosError;
            // @ts-ignore
            return rejectWithValue(axiosError.response?.data?.message || 'Произошла ошибка');
        }
    },
);
