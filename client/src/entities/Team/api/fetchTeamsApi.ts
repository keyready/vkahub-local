import { Team, TeamsFilters } from '../model/types/Team';

import { rtkApi } from '@/shared/api/rtkApi';
import { User } from '@/entities/User';

function teamFiltersToUrlString(filters: TeamsFilters): string {
    const params: string[] = [];

    if (filters.title) {
        params.push(`title=${encodeURIComponent(filters.title)}`);
    }

    if (filters.wanted) {
        params.push(`wanted=${filters.wanted}`);
    }

    if (filters.members && filters.members.length > 0) {
        params.push(`members=${filters.members.map((member) => member.toString()).join(',')}`);
    }

    return params.length > 0 ? `?${params.join('&')}` : '';
}

const fetchTeamsApi = rtkApi.injectEndpoints({
    endpoints: (build) => ({
        getTeams: build.query<Team[], TeamsFilters>({
            query: (filters) => {
                const filtersString = teamFiltersToUrlString(filters);

                return {
                    url: `/api/team/teams${filtersString}`,
                };
            },
        }),
        getTeamMembers: build.query<User[], number>({
            query: (teamId) => ({
                url: `/api/team/members?teamId=${teamId}`,
            }),
        }),
    }),
});

export const useTeams = fetchTeamsApi.useGetTeamsQuery;
export const useTeamMembers = fetchTeamsApi.useGetTeamMembersQuery;
