import * as yup from 'yup';

import { teamDescriptionRules, teamTitleRules } from './validationRules';

export const createTeamSchema = yup.object({
    title: teamTitleRules,
    description: teamDescriptionRules,
});

export type CreateTeamTypes = yup.InferType<typeof createTeamSchema>;
