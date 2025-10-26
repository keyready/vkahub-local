import { createSlice } from '@reduxjs/toolkit';

import { NotificationSchema } from '../types/NotificationSchema';
import { readNotification } from '../service/Notification';

const initialState: NotificationSchema = {
    isLoading: false,
    error: undefined,
};

export const NotificationSlice = createSlice({
    name: 'NotificationSlice',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(readNotification.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(readNotification.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(readNotification.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { actions: NotificationActions } = NotificationSlice;
export const { reducer: NotificationReducer } = NotificationSlice;
