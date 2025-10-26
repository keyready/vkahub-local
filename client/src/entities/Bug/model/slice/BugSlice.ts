import { createSlice } from '@reduxjs/toolkit';

import { BugSchema } from '../types/BugSchema';
import { createBugReport } from '../services/createBugReport';
import { changeBugStatus } from '../services/changeBugStatus';

const initialState: BugSchema = {
    data: undefined,
    isLoading: false,
    error: undefined,
};

export const BugSlice = createSlice({
    name: 'BugSlice',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createBugReport.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(createBugReport.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(createBugReport.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(changeBugStatus.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(changeBugStatus.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(changeBugStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { actions: BugActions } = BugSlice;
export const { reducer: BugReducer } = BugSlice;
