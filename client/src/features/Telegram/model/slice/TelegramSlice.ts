import { createSlice } from '@reduxjs/toolkit';

import { deleteMessage } from '../service/deleteMessage';
import { TelegramSchema } from '../types/TelegramSchema';
import { sendMessage } from '../service/sendMessage';

const initialState: TelegramSchema = {
    isLoading: false,
    error: undefined,
};

export const TelegramSlice = createSlice({
    name: 'TelegramSlice',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(deleteMessage.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(deleteMessage.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(deleteMessage.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(sendMessage.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(sendMessage.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { actions: TelegramActions } = TelegramSlice;
export const { reducer: TelegramReducer } = TelegramSlice;
