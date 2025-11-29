import * as yup from 'yup';

import { confirmPasswordRules, passwordRules, usernameRules } from './validationRules';

export const registrationSchema = yup.object({
    username: usernameRules,
    password: passwordRules,
});

export const changePasswordSchema = yup.object({
    newPassword: passwordRules.label('New password'),
    confirmNewPassword: confirmPasswordRules('newPassword').label('Confirm new password'),
});
