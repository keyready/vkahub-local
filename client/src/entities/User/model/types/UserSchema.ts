import { AuthErrorTypes, MembersFilters, RecoveryQuestion, User } from './User';

export interface UserSchema {
    data?: User;
    recoveryQuestions: RecoveryQuestion[];
    isLoading: boolean;
    isProfileChanging?: boolean;
    error?: string;
    authError?: AuthErrorTypes;
    selectedProfile?: User;
    filters?: MembersFilters;
}
