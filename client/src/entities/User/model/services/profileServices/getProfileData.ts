import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

import { ThunkConfig } from '@/app/providers/StoreProvider/config/StateSchema';
import { User } from '@/entities/User';

export const getProfileData = createAsyncThunk<User, string, ThunkConfig<string>>(
    'User/getProfileData',
    async (username, thunkAPI) => {
        const { extra, rejectWithValue } = thunkAPI;

        try {
            const response = await extra.api.get<User>(`/api/profile?username=${username}`);

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
