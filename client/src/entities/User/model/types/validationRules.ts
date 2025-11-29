import * as yup from 'yup';

export const usernameRules = yup
    .string()
    .required('Обязательное поле')
    .test(
        'ascii-only',
        'Пароль может содержать только латинские символы (без кириллицы, эмодзи и пр.)',
        (value) => {
            if (!value) return true;
            // eslint-disable-next-line no-control-regex
            return /^[\x00-\x7F]*$/.test(value);
        },
    )
    .matches(
        /^[a-zA-Z_][a-zA-Z0-9._]{1,18}[a-zA-Z0-9]$/,
        'Логин не может содержать ничего, кроме ЛАТИНСКИХ буков, нижнего подчеркивания и цифр; ' +
            'он не должен начинаться с цифры',
    )
    .min(5, 'Логин должен содержать минимум 5 символов')
    .max(20, 'Логин должен содержать максимум 20 символов');

export const passwordRules = yup
    .string()
    .required('Обязательное поле')
    .test(
        'no-spaces',
        'НЕ НАДО СТАВИТЬ ПРОБЕЛЫ В ПАРОЛЬ',
        (value) => value == null || !value.includes(' '),
    )
    .test(
        'ascii-only',
        'Пароль может содержать только латинские символы (без кириллицы, эмодзи и пр.)',
        (value) => {
            if (!value) return true;
            // eslint-disable-next-line no-control-regex
            return /^[\x00-\x7F]*$/.test(value);
        },
    )
    .min(8, 'Пароль не может быть короче 8 символов')
    .max(64, 'Пароль не может быть длиннее 64 символов')
    .matches(/[a-z]/, 'Пароль должен содержать хотя бы одну строчную букву')
    .matches(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную букву')
    .matches(/\d/, 'Пароль должен содержать хотя бы одну цифру');
// .matches(
//     /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/,
//     'Пароль должен содержать хотя бы один спец. символ (!@#$%^&* и т.д.)',
// );

export const confirmPasswordRules = (refField: string) =>
    yup
        .string()
        .required('Подтвердите пароль')
        .oneOf([yup.ref(refField)], 'Пароли должны совпадать');
