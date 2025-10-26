import { createSelector } from '@reduxjs/toolkit';

import { UserRoles } from '../types/User';

import { StateSchema } from '@/app/providers/StoreProvider';

// TODO веб безопасность вышла нахуй из чата, не забудь ее потом позвать обратно
export const getUserRoles = (state: StateSchema) =>
    state.user.data?.roles || [
        UserRoles.MAIL_CONFIRMED,
        UserRoles.USER,
        UserRoles.PROFILE_CONFIRMED,
    ];

export const isUserAdmin = createSelector(getUserRoles, (userRoles) =>
    Boolean(userRoles?.includes(UserRoles.ADMIN)),
);
