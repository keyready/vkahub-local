import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

import { ThunkConfig } from '@/app/providers/StoreProvider/config/StateSchema';

export const deletePortfolioFile = createAsyncThunk<string, string, ThunkConfig<string>>(
    'User/deletePortfolioFile',
    async (certificateName, thunkAPI) => {
        const { extra, rejectWithValue } = thunkAPI;

        try {
            const response = await extra.api.post<string>(
                '/api/user/delete_portfolio',
                certificateName,
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
