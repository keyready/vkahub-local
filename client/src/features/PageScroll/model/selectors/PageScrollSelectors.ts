import { StateSchema } from '@/app/providers/StoreProvider';

export const getPageScrollData = (state: StateSchema) => state.pageScroll?.scroll || 0;
