import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { UserSchema } from '../types/UserSchema';
import { signupUser } from '../services/authServices/signupUser';
import { loginUser } from '../services/authServices/loginUser';
import { AuthErrorTypes, MembersFilters, User } from '../types/User';
import { getUserDataService } from '../services/profileServices/getUserData';
import { getProfileData } from '../services/profileServices/getProfileData';
import { sendRecoveryLink } from '../services/authServices/sendRecoveryLink';
import { changePassword } from '../services/authServices/changePassword';
import { confirmEmail } from '../services/authServices/confirmEmail';
import { changeUserProfile } from '../services/profileServices/changeUserProfile';
import { logoutService } from '../services/authServices/logoutService';
import { addPortfolioFile } from '../services/profileServices/addPortfolioFile';
import { deletePortfolioFile } from '../services/profileServices/deletePortfolioFile';

import { USER_ACCESS_TOKEN, USER_REFRESH_TOKEN } from '@/shared/const';

const initialState: UserSchema = {
    data: undefined,
    isLoading: false,
    error: undefined,
    selectedProfile: undefined,
    filters: {
        isMember: false,
    },
};

export const UserSlice = createSlice({
    name: 'UserSlice',
    initialState,
    reducers: {
        setMembersFilters: (state, action: PayloadAction<MembersFilters>) => {
            state.filters = action.payload;
        },
        clearAuthError: (state) => {
            state.authError = undefined;
        },

        setUserData: (state, action: PayloadAction<User>) => {
            state.data = action.payload;
        },
        logout: (state) => {
            localStorage.removeItem(USER_ACCESS_TOKEN);
            localStorage.removeItem(USER_REFRESH_TOKEN);
            state.data = undefined;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(signupUser.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(signupUser.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(signupUser.rejected, (state, action) => {
                state.isLoading = false;
                state.authError = action.payload as AuthErrorTypes;
            })

            .addCase(logoutService.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(logoutService.fulfilled, (state) => {
                state.isLoading = false;
                state.data = undefined;
            })
            .addCase(logoutService.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(loginUser.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(loginUser.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.authError = action.payload as AuthErrorTypes;
            })

            .addCase(sendRecoveryLink.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(sendRecoveryLink.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(sendRecoveryLink.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(changeUserProfile.pending, (state) => {
                state.error = undefined;
                state.isProfileChanging = true;
            })
            .addCase(changeUserProfile.fulfilled, (state) => {
                state.isProfileChanging = false;
            })
            .addCase(changeUserProfile.rejected, (state, action) => {
                state.isProfileChanging = false;
                state.error = action.payload;
            })

            .addCase(changePassword.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(changePassword.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(changePassword.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(addPortfolioFile.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(addPortfolioFile.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(addPortfolioFile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(deletePortfolioFile.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(deletePortfolioFile.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(deletePortfolioFile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(confirmEmail.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(confirmEmail.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(confirmEmail.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(getUserDataService.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(getUserDataService.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(getUserDataService.rejected, (state, action) => {
                localStorage.removeItem(USER_ACCESS_TOKEN);
                localStorage.removeItem(USER_REFRESH_TOKEN);
                state.isLoading = false;
                state.data = undefined;
                state.error = action.payload;
            })

            .addCase(getProfileData.pending, (state) => {
                state.error = undefined;
                state.isLoading = true;
            })
            .addCase(getProfileData.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                state.selectedProfile = action.payload;
            })
            .addCase(getProfileData.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { actions: UserActions } = UserSlice;
export const { reducer: UserReducer } = UserSlice;
