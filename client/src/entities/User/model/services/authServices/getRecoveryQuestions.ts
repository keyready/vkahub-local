import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

import { RecoveryQuestion } from '../../types/User';

import { ThunkConfig } from '@/app/providers/StoreProvider/config/StateSchema';

export const getRecoveryQuestions = createAsyncThunk<
    RecoveryQuestion[],
    string,
    ThunkConfig<string>
>('User/getRecoveryQuestions', async (code, thunkAPI) => {
    const { extra, rejectWithValue } = thunkAPI;

    try {
        const response = await extra.api.get<RecoveryQuestion[]>('/api/auth/recovery_questions');

        if (!response.data) {
            throw new Error();
        }

        return response.data;
    } catch (e) {
        const axiosError = e as AxiosError;
        // @ts-ignore
        return rejectWithValue(axiosError.response?.data?.message || 'Произошла ошибка');
    }
});
