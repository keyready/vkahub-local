import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

import { ThunkConfig } from '@/app/providers/StoreProvider/config/StateSchema';

interface ChangePasswordProps {
    new_password: string;
    username: string;
}

export const changePassword = createAsyncThunk<string, ChangePasswordProps, ThunkConfig<string>>(
    'User/changePassword',
    async (props, thunkAPI) => {
        const { extra, rejectWithValue } = thunkAPI;

        try {
            // const response = await extra.api.post<string>('/api/auth/change_password', props);
            return 'ok';

            // if (!response.data) {
            //     throw new Error();
            // }
            //
            // return response.data;
        } catch (e) {
            const axiosError = e as AxiosError;
            // @ts-ignore
            return rejectWithValue(axiosError.response?.data?.message || 'Произошла ошибка');
        }
    },
);
