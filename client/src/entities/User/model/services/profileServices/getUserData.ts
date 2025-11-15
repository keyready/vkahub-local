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

            // const response = {
            //     data: {
            //         id: 1,
            //         username: 'keyready',
            //         mail: 'keyready@61kaf.vka',
            //         password: '123123123123123',
            //         avatar: '123123123123123',
            //         roles: [
            //             UserRoles.MAIL_CONFIRMED,
            //             UserRoles.PROFILE_CONFIRMED,
            //             UserRoles.USER,
            //             UserRoles.ADMIN,
            //         ],
            //         teamId: 1,
            //         skills: ['Скиллов', 'у', 'меня', 'нет('],
            //         positions: ['front'],
            //         created_at: new Date(),
            //         lastOnline: new Date(),
            //     },
            // };

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
