import { Team, TeamsFilters } from './Team';

export interface TeamSchema {
    data?: Team;
    isLoading: boolean;
    error?: string;

    filters?: TeamsFilters;

    invitationError?: string;
    isInvitationLoading?: boolean;
}
