import { StateSchema } from '@/app/providers/StoreProvider';

export const getEventData = (state: StateSchema) => state.event?.data;
export const getParsedEventData = (state: StateSchema) => state.event?.parsedEvent;
export const getIsEventLoading = (state: StateSchema) => state.event?.isLoading;
export const getIsReportCreating = (state: StateSchema) => state.event?.isReportCreating;
export const getEventError = (state: StateSchema) => state.event?.error;
