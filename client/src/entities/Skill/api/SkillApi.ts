import { Skill } from '../model/types/Skill';

import { rtkApi } from '@/shared/api/rtkApi';

interface SkillsResponse { id: number; name: string; Author: string }

const fetchSkillsApi = rtkApi.injectEndpoints({
    endpoints: (build) => ({
        fetchAllSkills: build.query<Skill[], void>({
            query: () => ({
                url: `/api/skills`,
            }),
            transformResponse: (response: SkillsResponse[]) =>
                response
                    .map((serverSkill) => ({
                        id: serverSkill.id, 
                        title: serverSkill.name,
                        author: serverSkill.Author,
                    }))
                    .sort((a, b) => a.title.localeCompare(b.title)),
        }),
    }),
});

export const useSkills = fetchSkillsApi.useFetchAllSkillsQuery;
