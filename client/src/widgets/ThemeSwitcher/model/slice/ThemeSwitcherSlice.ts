import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { Theme, ThemeSchema } from '../types/ThemeSwitcher';

const applyThemeToBody = (theme: Theme) => {
    if (typeof document !== 'undefined') {
        if (theme === 'dark') {
            document.body.classList.remove('vka_theme');
            document.body.classList.add('dark_theme', 'dark');
        } else {
            document.body.classList.add('vka_theme');
            document.body.classList.remove('dark_theme', 'dark');
        }
    }
};

const getInitialTheme = (): Theme => {
    if (typeof window !== 'undefined') {
        return (localStorage.getItem('theme') as Theme) || 'light';
    }
    return 'light';
};

const initialTheme = getInitialTheme();
applyThemeToBody(initialTheme);

const initialState: ThemeSchema = {
    theme: initialTheme,
};

const ThemeSwitcherSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        setTheme(state, action: PayloadAction<Theme>) {
            state.theme = action.payload;
            if (typeof window !== 'undefined') {
                localStorage.setItem('theme', action.payload);
            }
            applyThemeToBody(action.payload);
        },
        toggleTheme(state) {
            const nextTheme: Theme = state.theme === 'light' ? 'dark' : 'light';
            state.theme = nextTheme;
            if (typeof window !== 'undefined') {
                localStorage.setItem('theme', nextTheme);
            }
            applyThemeToBody(nextTheme);
        },
    },
});

export const { actions: ThemeSwitcherActions, reducer: ThemeSwitcherReducer } = ThemeSwitcherSlice;
