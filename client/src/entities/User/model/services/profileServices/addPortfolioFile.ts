import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

import { ThunkConfig } from '@/app/providers/StoreProvider/config/StateSchema';

export const addPortfolioFile = createAsyncThunk<string, FormData, ThunkConfig<string>>(
    'User/addPortfolioFile',
    async (formData, thunkAPI) => {
        const { extra, rejectWithValue } = thunkAPI;

        try {
            const response = await extra.api.post<string>('/api/user/add_portfolio', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

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
