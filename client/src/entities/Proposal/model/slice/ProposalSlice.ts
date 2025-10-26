import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ProposalSchema } from '../types/ProposalSchema';
import { createProposal } from '../service/createProposal';
import { approveProposal } from '../service/approveProposal';
import { cancelProposal } from '../service/cancelProposal';

const initialState: ProposalSchema = {
    data: undefined,
    isLoading: false,
    error: undefined,
};

export const ProposalSlice = createSlice({
    name: 'ProposalSlice',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createProposal.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(createProposal.fulfilled, (state, action: PayloadAction<any>) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(createProposal.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(approveProposal.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(approveProposal.fulfilled, (state, action: PayloadAction<any>) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(approveProposal.rejected, (state) => {
                state.isLoading = false;
            })

            .addCase(cancelProposal.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(cancelProposal.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(cancelProposal.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { actions: ProposalActions } = ProposalSlice;
export const { reducer: ProposalReducer } = ProposalSlice;
