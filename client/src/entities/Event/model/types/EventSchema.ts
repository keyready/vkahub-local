import { Event } from './Event';

export interface EventSchema {
    data?: Event;
    isLoading: boolean;
    parsedEvent?: string;
    error?: string;
    isReportCreating: boolean;
}
