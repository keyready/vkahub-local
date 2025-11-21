import { Achievement } from '../model/types/Achievement';

import { rtkApi } from '@/shared/api/rtkApi';

const fetchTeamsApi = rtkApi.injectEndpoints({
    endpoints: (build) => ({
        getTeamAchievements: build.query<Achievement[], string>({
            query: (teamId) => ({
                url: `/api/achievements?teamId=${teamId}`,
            }),
        }),
        getMemberAchievements: build.query<Achievement[], number | string | undefined>({
            query: (userId) => ({
                url: `/api/achievements?userId=${userId}`,
            }),
        }),
    }),
});

export const useTeamAchievements = fetchTeamsApi.useGetTeamAchievementsQuery;
export const useMemberAchievements = fetchTeamsApi.useGetMemberAchievementsQuery;
