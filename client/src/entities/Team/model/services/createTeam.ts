import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

import { ThunkConfig } from '@/app/providers/StoreProvider/config/StateSchema';
import { getUserData } from '@/entities/User';

export const createTeam = createAsyncThunk<string, FormData, ThunkConfig<string>>(
    'Team/createTeam',
    async (team, thunkAPI) => {
        const { extra, rejectWithValue, getState } = thunkAPI;

        const user = getUserData(getState());

        team.append('captain_id', user?.id?.toString() || '-1');

        try {
            const response = await extra.api.post<string>('/api/team/add', team, {
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
            if (axiosError.code && axiosError.code === '413') {
                return rejectWithValue('Файл слишком большой');
            }
            // @ts-ignore
            return rejectWithValue(axiosError.response?.data?.message || 'Произошла ошибка');
        }
    },
);
