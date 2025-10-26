import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { TrackSchema } from '../types/TrackSchema';
import { createTrack } from '../service/createTrack';
import { registerTrackTeam } from '../service/registerTrackTeam';

const initialState: TrackSchema = {
    isLoading: false,
    error: undefined,
};

export const TrackSlice = createSlice({
    name: 'TrackSlice',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createTrack.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(createTrack.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(createTrack.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(registerTrackTeam.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(registerTrackTeam.fulfilled, (state, action: PayloadAction<any>) => {
                state.isLoading = false;
            })
            .addCase(registerTrackTeam.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { actions: TrackActions } = TrackSlice;
export const { reducer: TrackReducer } = TrackSlice;
