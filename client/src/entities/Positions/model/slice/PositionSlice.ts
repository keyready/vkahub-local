import { createSlice } from '@reduxjs/toolkit';

import { PositionSchema } from '../types/Position';
import { createPosition } from '../service/createPosition';

const initialState: PositionSchema = {
    data: undefined,
    isLoading: false,
    error: undefined,
};

export const PositionSlice = createSlice({
    name: 'PositionSlice',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createPosition.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(createPosition.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(createPosition.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { actions: PositionActions } = PositionSlice;
export const { reducer: PositionReducer } = PositionSlice;
