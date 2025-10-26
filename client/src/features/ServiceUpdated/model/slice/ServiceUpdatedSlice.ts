import { createSlice } from '@reduxjs/toolkit';

import { ServiceUpdated } from '../types/ServiceUpdated';

import { APP_VERSION, CURRENT_APP_VERSION } from '@/shared/const';

const initialState: ServiceUpdated = {
    isUpdateAvailable: false,
};

export const ServiceUpdatedSlice = createSlice({
    name: 'ServiceUpdatedSlice',
    initialState,
    reducers: {
        checkUpdateAvailability: (state) => {
            const storedVersion = localStorage.getItem(APP_VERSION);
            if (storedVersion !== CURRENT_APP_VERSION) {
                state.isUpdateAvailable = true;
            }
        },
        updateApplication: (state) => {
            localStorage.setItem(APP_VERSION, CURRENT_APP_VERSION);
            state.isUpdateAvailable = false;
        },
    },
});

export const { actions: ServiceUpdatedActions } = ServiceUpdatedSlice;
export const { reducer: ServiceUpdatedReducer } = ServiceUpdatedSlice;
