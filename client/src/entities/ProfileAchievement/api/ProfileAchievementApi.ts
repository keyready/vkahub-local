import { ProfileAchievement } from '../model/types/ProfileAchievement';

import { rtkApi } from '@/shared/api/rtkApi';

const fetchProfileAchievements = rtkApi.injectEndpoints({
    endpoints: (build) => ({
        getProfileAchievements: build.query<ProfileAchievement[], string | void>({
            query: (username) => ({
                url: username
                    ? `/api/profile-achievements?username=${username}`
                    : '/api/profile-achievements',
            }),
        }),
    }),
});

export const useProfileAchievements = fetchProfileAchievements.useGetProfileAchievementsQuery;
