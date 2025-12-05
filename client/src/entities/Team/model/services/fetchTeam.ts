import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

import { Team } from '../types/Team';

import { ThunkConfig } from '@/app/providers/StoreProvider/config/StateSchema';

export const fetchTeam = createAsyncThunk<Team, string, ThunkConfig<string>>(
    'Team/fetchTeam',
    async (teamId, thunkAPI) => {
        const { extra, rejectWithValue } = thunkAPI;

        try {
            const response = await extra.api.get<Team>(`/api/team/fetch_team?id=${teamId}`);

            if (!response.data) {
                throw new Error();
            }

            // FIXME replace with real data
            return {
                ...response.data,
                image: {
                    image: response.data.image as unknown as string,
                    hash: 'U39jfh~C4T%2.8XmIoSM00In?vIo4TiI=|w_',
                },
            } as Team;
        } catch (e) {
            const axiosError = e as AxiosError;
            // @ts-ignore
            return rejectWithValue(axiosError.response?.data?.message || 'Произошла ошибка');
        }
    },
);
