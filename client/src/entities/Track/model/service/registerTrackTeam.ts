import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

import { ThunkConfig } from '@/app/providers/StoreProvider/config/StateSchema';

interface RegisterTrackTeamProps {
    teamId: number;
    trackId?: number;
    eventId?: number;
}

export const registerTrackTeam = createAsyncThunk<
    string,
    RegisterTrackTeamProps,
    ThunkConfig<string>
>('Track/registerTrackTeam', async (props, thunkAPI) => {
    const { extra, rejectWithValue } = thunkAPI;

    try {
        const response = await extra.api.post<string>('/api/tracks/partTeam', {
            teamId: props.teamId,
            ...(props?.trackId
                ? { trackId: props.trackId, eventId: 0 }
                : { eventId: props?.eventId }),
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
});
