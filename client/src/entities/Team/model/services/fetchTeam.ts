import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

import { Team } from '../types/Team';

import { ThunkConfig } from '@/app/providers/StoreProvider/config/StateSchema';

interface ApiTeamResponse {
    data: Team;
}

export const fetchTeam = createAsyncThunk<Team, string, ThunkConfig<string>>(
    'Team/fetchTeam',
    async (teamId, thunkAPI) => {
        const { extra, rejectWithValue } = thunkAPI;

        try {
            const response = await extra.api.get<Team>(`/api/team/fetch_team?id=${teamId}`);

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
