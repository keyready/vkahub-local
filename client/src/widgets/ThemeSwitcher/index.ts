export type { Theme, ThemeSchema } from './model/types/ThemeSwitcher';

export { ThemeSwitcherReducer, ThemeSwitcherActions } from './model/slice/ThemeSwitcherSlice';
export { getCurrentTheme } from './model/selectors/getThemeSelectors';

export { ThemeSwitcher } from './ui/ThemeSwitcher';
