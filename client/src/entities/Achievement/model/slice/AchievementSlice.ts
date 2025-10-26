import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AchievementSchema } from '../types/AchievementSchema';
import { fetchAchievement } from '../services/fetchAchievement';
import { createAchievement } from '../services/createAchievement';

const initialState: AchievementSchema = {
    data: undefined,
    isLoading: false,
    error: undefined,
};

export const AchievementSlice = createSlice({
    name: 'AchievementSlice',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAchievement.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(fetchAchievement.fulfilled, (state, action: PayloadAction<any>) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchAchievement.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(createAchievement.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(createAchievement.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(createAchievement.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { actions: AchievementActions } = AchievementSlice;
export const { reducer: AchievementReducer } = AchievementSlice;
