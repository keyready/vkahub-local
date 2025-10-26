import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { TeamSchema } from '../types/TeamSchema';
import { fetchTeam } from '../services/fetchTeam';
import { Team, TeamsFilters } from '../types/Team';
import { createTeam } from '../services/createTeam';
import { inviteMember } from '../services/inviteMember';
import { deleteMember } from '../services/deleteMember';
import { transferCaptainRights } from '../services/transferCaptainRights';
import { leaveTeam } from '../services/leaveTeam';
import { participatingRequest } from '../services/participatingRequest';
import { changeTeam } from '../services/changeTeam';

const initialState: TeamSchema = {
    data: undefined,
    isLoading: false,
    error: undefined,
};

export const TeamSlice = createSlice({
    name: 'TeamSlice',
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<TeamsFilters>) => {
            state.filters = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTeam.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(fetchTeam.fulfilled, (state, action: PayloadAction<Team>) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchTeam.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(createTeam.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(createTeam.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(createTeam.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(changeTeam.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(changeTeam.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(changeTeam.rejected, (state, action) => {
                state.isLoading = false;
            })

            .addCase(deleteMember.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(deleteMember.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(deleteMember.rejected, (state, action) => {
                state.isLoading = false;
            })

            .addCase(transferCaptainRights.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(transferCaptainRights.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(transferCaptainRights.rejected, (state, action) => {
                state.isLoading = false;
            })

            .addCase(inviteMember.pending, (state) => {
                state.invitationError = undefined;
                state.isInvitationLoading = true;
            })
            .addCase(inviteMember.fulfilled, (state) => {
                state.isInvitationLoading = false;
            })
            .addCase(inviteMember.rejected, (state, action) => {
                state.isInvitationLoading = false;
                state.invitationError = action.payload;
            })

            .addCase(participatingRequest.pending, (state) => {
                state.invitationError = undefined;
                state.isInvitationLoading = true;
            })
            .addCase(participatingRequest.fulfilled, (state) => {
                state.isInvitationLoading = false;
            })
            .addCase(participatingRequest.rejected, (state, action) => {
                state.isInvitationLoading = false;
                state.invitationError = action.payload;
            })

            .addCase(leaveTeam.pending, (state) => {
                state.invitationError = undefined;
                state.isInvitationLoading = true;
            })
            .addCase(leaveTeam.fulfilled, (state) => {
                state.isInvitationLoading = false;
            })
            .addCase(leaveTeam.rejected, (state, action) => {
                state.isInvitationLoading = false;
                state.invitationError = action.payload;
            });
    },
});

export const { actions: TeamActions } = TeamSlice;
export const { reducer: TeamReducer } = TeamSlice;
