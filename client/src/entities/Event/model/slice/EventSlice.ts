import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { fetchEvent } from '../services/fetchEvent';
import { createEvent } from '../services/createEvent';
import { Event } from '../types/Event';
import { EventSchema } from '../types/EventSchema';
import { parseEvent } from '../services/parseEvent';

import { createReport } from '@/entities/Event/model/services/createReport';

const initialState: EventSchema = {
    data: undefined,
    parsedEvent: undefined,
    isLoading: false,
    isReportCreating: false,
    error: undefined,
};

export const EventSlice = createSlice({
    name: 'EventSlice',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchEvent.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(fetchEvent.fulfilled, (state, action: PayloadAction<Event>) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchEvent.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(createEvent.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(createEvent.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(createEvent.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(createReport.pending, (state) => {
                state.error = undefined;
                state.isReportCreating = true;
            })
            .addCase(createReport.fulfilled, (state) => {
                state.isReportCreating = false;
            })
            .addCase(createReport.rejected, (state, action) => {
                state.isReportCreating = false;
                state.error = action.payload;
            })

            .addCase(parseEvent.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(parseEvent.fulfilled, (state, action: PayloadAction<string>) => {
                state.isLoading = false;
                state.parsedEvent = action.payload;
            })
            .addCase(parseEvent.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { actions: EventActions } = EventSlice;
export const { reducer: EventReducer } = EventSlice;
