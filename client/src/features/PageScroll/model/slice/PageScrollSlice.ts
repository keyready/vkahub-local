import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { PageScrollSchema } from '../types/PageScrollSchema';

const initialState: PageScrollSchema = {
    scroll: undefined,
    isLoading: false,
    error: undefined,
};

export const PageScrollSlice = createSlice({
    name: 'PageScrollSlice',
    initialState,
    reducers: {
        setScrollPosition: (state, action: PayloadAction<number>) => {
            state.scroll = action.payload;
        },
    },
});

export const { actions: PageScrollActions } = PageScrollSlice;
export const { reducer: PageScrollReducer } = PageScrollSlice;
