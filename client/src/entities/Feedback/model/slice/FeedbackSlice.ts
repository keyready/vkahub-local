import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { BugSchema } from '../../../Bug/model/types/BugSchema';
import { createFeedback } from '../services/createFeedback';

const initialState: BugSchema = {
    data: undefined,
    isLoading: false,
    error: undefined,
};

export const FeedbackSlice = createSlice({
    name: 'FeedbackSlice',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createFeedback.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(createFeedback.fulfilled, (state, action: PayloadAction<any>) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(createFeedback.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { actions: FeedbackActions } = FeedbackSlice;
export const { reducer: FeedbackReducer } = FeedbackSlice;
