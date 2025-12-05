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

            // FIXME remove before production
            transformResponse: (teams: Team[]) =>
                teams.map((t) => ({
                    ...t,
                    image: {
                        image: t.image as unknown as string,
                        hash: 'U39jfh~C4T%2.8XmIoSM00In?vIo4TiI=|w_',
                    },
                })),
        }),
        getTeamMembers: build.query<User[], string>({
            query: (teamId) => ({
                url: `/api/team/members?teamId=${teamId}`,
            }),
        }),
    }),
});

export const useTeams = fetchTeamsApi.useGetTeamsQuery;
export const useTeamMembers = fetchTeamsApi.useGetTeamMembersQuery;
