import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

import { ProposalType } from '../types/Proposal';

import { ThunkConfig } from '@/app/providers/StoreProvider/config/StateSchema';

interface CreateProposalInput {
    type: ProposalType;
    teamId: number;
    usersId: number[];
    message?: string;
}

export const createProposal = createAsyncThunk<string, CreateProposalInput, ThunkConfig<string>>(
    'Proposal/createProposal',
    async (props, thunkAPI) => {
        const { extra, rejectWithValue } = thunkAPI;

        try {
            const response = await extra.api.post<string>('/api/proposal/create', props);

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
