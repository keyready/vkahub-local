import { AuthErrorTypes, MembersFilters, User } from './User';

export interface UserSchema {
    data?: User;
    isLoading: boolean;
    isProfileChanging?: boolean;
    error?: string;
    authError?: AuthErrorTypes;
    selectedProfile?: User;
    filters?: MembersFilters;
}
