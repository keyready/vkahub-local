import * as yup from 'yup';

export const eventTitleRules = yup
    .string()
    .required('Обязательное поле')
    .test(
        'latin-and-cyrillic-only',
        'Название события может содержать только латинские и кириллические символы (без эмодзи и пр.)',
        (value) => {
            if (!value) return true;
            return /^[a-zA-Zа-яА-ЯёЁ0-9\s!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]*$/.test(value);
        },
    )
    .min(5, 'Название события должно содержать минимум 5 символа');

export const eventSponsorsRules = yup
    .string()
    .required('Обязательное поле')
    .test(
        'latin-and-cyrillic-only',
        'Название спонсоров может содержать только латинские и кириллические символы (без эмодзи и пр.)',
        (value) => {
            if (!value) return true;
            return /^[a-zA-Zа-яА-ЯёЁ0-9\s!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]*$/.test(value);
        },
    );

export const eventDescriptionRules = yup
    .string()
    .required('Обязательно добавьте описание')
    .test(
        'no-html',
        'Прям почти, но все еще очень слабо :)',
        (value) => !value || !/<[a-z][\s\S]*>/i.test(value),
    )
    .max(1000, 'Не более 1000 символов');

export const eventShortDescriptionRules = yup
    .string()
    .required('Обязательно добавьте краткое описание')
    .test(
        'no-html',
        'Прям почти, но все еще очень слабо :)',
        (value) => !value || !/<[a-z][\s\S]*>/i.test(value),
    )
    .max(200, 'Не более 200 символов');

export const eventTypeRules = yup
    .string()
    .required('Обязательно выберите тип события')
    .oneOf(['ctf', 'hack', 'other'], 'Допустимые значения: hack, ctf, other');
