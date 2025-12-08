import * as yup from 'yup';

export const teamTitleRules = yup
    .string()
    .required('Обязательное поле')
    .test(
        'latin-and-cyrillic-only',
        'Название команды может содержать только латинские и кириллические символы (без эмодзи и пр.)',
        (value) => {
            if (!value) return true;
            return /^[a-zA-Zа-яА-ЯёЁ0-9\s!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]*$/.test(value);
        },
    )
    .min(5, 'Название команды должно содержать минимум 5 символа')
    .max(30, 'Название команды должно содержать максимум 30 символов');

export const teamDescriptionRules = yup
    .string()
    .required('Обязательное поле')
    .test(
        'no-html',
        'Прям почти, но все еще очень слабо :)',
        (value) => !value || !/<[a-z][\s\S]*>/i.test(value),
    )
    .max(1000, 'Не более 1000 символов');
