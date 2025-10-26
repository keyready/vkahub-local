import { StateSchema } from '@/app/providers/StoreProvider';

export const getCurrentTheme = (state: StateSchema) => state.theme.theme;
