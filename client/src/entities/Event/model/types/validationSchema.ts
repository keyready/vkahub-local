import * as yup from 'yup';

import {
    eventDescriptionRules,
    eventShortDescriptionRules,
    eventSponsorsRules,
    eventTitleRules,
    eventTypeRules,
} from './validationRules';

export const createEventValidationSchema = yup.object({
    title: eventTitleRules,
    sponsors: eventSponsorsRules,
    description: eventDescriptionRules,
    shortDescription: eventShortDescriptionRules,
    type: eventTypeRules,
});

export type CreateEventTypes = yup.InferType<typeof createEventValidationSchema>;
