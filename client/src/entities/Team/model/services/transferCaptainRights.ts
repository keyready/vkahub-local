import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

import { ThunkConfig } from '@/app/providers/StoreProvider/config/StateSchema';

interface TransferCaptainRightsParams {
    memberId: string; // куда передать права
    teamId: string; // команда, которую меняем
    originalCaptainId: string; // кто был капитаном до передачи
}

export const transferCaptainRights = createAsyncThunk<
    string,
    TransferCaptainRightsParams,
    ThunkConfig<string>
>('Team/transferCaptainRights', async (props, thunkAPI) => {
    const { extra, rejectWithValue } = thunkAPI;

    try {
        const response = await extra.api.post<string>('/api/team/transfer-captain-rights', props);

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
