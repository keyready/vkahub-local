export function objectToFormData(
    obj: Record<string, any>,
    options: {
        nullValueHandling?: 'stringify' | 'omit' | 'empty';
        undefinedValueHandling?: 'stringify' | 'omit' | 'empty';
    } = {},
): FormData {
    const { nullValueHandling = 'stringify', undefinedValueHandling = 'omit' } = options;

    const formData = new FormData();

    const appendValue = (key: string, value: any) => {
        if (value === null) {
            switch (nullValueHandling) {
                case 'stringify':
                    formData.append(key, 'null');
                    return;
                case 'empty':
                    formData.append(key, '');
                    return;
                default:
                    return;
            }
        }

        if (value === undefined) {
            switch (undefinedValueHandling) {
                case 'stringify':
                    formData.append(key, 'undefined');
                    return;
                case 'empty':
                    formData.append(key, '');
                    return;
                default:
                    return;
            }
        }

        if (Array.isArray(value)) {
            value.forEach((item) => appendValue(key, item));
        } else if (value instanceof File || value instanceof Blob) {
            formData.append(key, value);
        } else if (typeof value === 'object') {
            Object.entries(value).forEach(([nestedKey, nestedValue]) => {
                appendValue(`${key}[${nestedKey}]`, nestedValue);
            });
        } else {
            formData.append(key, String(value));
        }
    };

    Object.entries(obj).forEach(([key, value]) => {
        appendValue(key, value);
    });

    return formData;
}
