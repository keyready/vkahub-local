import * as yup from 'yup';

import {
    confirmPasswordRules,
    passwordRules,
    requiredCyrillicString,
    requiredCyrillicSymbolicString,
    usernameRules,
} from './validationRules';

const trimAndValidate = requiredCyrillicString.transform((value) =>
    typeof value === 'string' ? value.trim() : value,
);

export const registrationSchema = yup.object({
    username: usernameRules,
    password: passwordRules,
});

export const changePasswordSchema = yup.object({
    newPassword: passwordRules.label('New password'),
    confirmNewPassword: confirmPasswordRules('newPassword').label('Confirm new password'),
});

export const profileCompletionSchema = yup.object({
    firstname: trimAndValidate,
    lastname: trimAndValidate,
    middlename: trimAndValidate,
    recoveryQuestion: requiredCyrillicSymbolicString,
    recoveryAnswer: yup
        .string()
        .required('На любой вопрос должен быть ответ')
        .when('$requireAnswer', {
            is: false,
            then: (schema) => schema.optional(),
        }),
    rank: requiredCyrillicSymbolicString,
    group_number: requiredCyrillicSymbolicString,
    description: yup
        .string()
        .test(
            'no-html',
            'Прям почти, но все еще очень слабо :)',
            (value) => !value || !/<[a-z][\s\S]*>/i.test(value),
        )
        .optional()
        .max(1000, 'Не более 1000 символов'),
});

export type UserProfileFormValues = yup.InferType<typeof profileCompletionSchema>;
