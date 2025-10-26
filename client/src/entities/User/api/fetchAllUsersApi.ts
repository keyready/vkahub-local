import { MembersFilters, User } from '../model/types/User';

import { rtkApi } from '@/shared/api/rtkApi';

function membersFiltersString(filters: MembersFilters): string {
    const params: string[] = [];

    if (filters.lastname) {
        params.push(`lastname=${filters.lastname}`);
    }

    if (filters.username) {
        params.push(`username=${filters.username}`);
    }

    if (filters.wanted) {
        params.push(`wanted=${filters.wanted}`);
    }

    if (filters.isMember) {
        params.push('isMember=true');
    } else params.push('isMember=false');

    return params.length > 0 ? `?${params.join('&')}` : '';
}

const fetchAllUsersApi = rtkApi.injectEndpoints({
    endpoints: (build) => ({
        getUsers: build.query<User[], MembersFilters>({
            query: (filters) => ({
                url: `/api/members${membersFiltersString(filters)}`,
            }),
        }),
    }),
});

export const useUsers = fetchAllUsersApi.useGetUsersQuery;
