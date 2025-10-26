import { Bug } from './Bug';

export interface BugSchema {
    data?: Bug;
    isLoading: boolean;
    error?: string;
}
