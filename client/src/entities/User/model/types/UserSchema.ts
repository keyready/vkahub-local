import { AuthErrorTypes, MembersFilters, RecoveryQuestion, User, UserSettings } from './User';

export interface UserSchema {
    data?: User;
    settings: UserSettings;
    recoveryQuestions: RecoveryQuestion[];
    isLoading: boolean;
    isProfileChanging?: boolean;
    error?: string;
    authError?: AuthErrorTypes;
    selectedProfile?: User;
    filters?: MembersFilters;
}
