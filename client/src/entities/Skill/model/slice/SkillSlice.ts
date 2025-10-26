import { createSlice } from '@reduxjs/toolkit';

import { SkillSchema } from '../types/Skill';
import { createSkill } from '../service/createSkill';

const initialState: SkillSchema = {
    data: undefined,
    isLoading: false,
    error: undefined,
};

export const SkillSlice = createSlice({
    name: 'SkillSlice',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createSkill.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(createSkill.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(createSkill.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { actions: SkillActions } = SkillSlice;
export const { reducer: SkillReducer } = SkillSlice;
