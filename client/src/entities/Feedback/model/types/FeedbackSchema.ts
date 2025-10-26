import { Feedback } from './Feedback';

export interface FeedbackSchema {
    data?: Feedback;
    isLoading: boolean;
    error?: string;
}
