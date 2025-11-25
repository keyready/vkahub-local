import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

import { ThunkConfig } from '@/app/providers/StoreProvider/config/StateSchema';

interface RecoveryAnswerProps {
    username: string;
    answer: string;
}

export const approveRecoveryAnswer = createAsyncThunk<
    string,
    RecoveryAnswerProps,
    ThunkConfig<string>
>('User/approveRecoveryAnswer', async (recoveryProps, thunkAPI) => {
    const { extra, rejectWithValue } = thunkAPI;

    try {
        // const response = await extra.api.post<string>('/api/auth/approve_recovery', recoveryProps);
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
});
