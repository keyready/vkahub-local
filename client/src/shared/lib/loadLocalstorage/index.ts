export function createLocalStorageParser<T extends Record<string, any>>() {
    /**
     * Безопасно парсит значение из localStorage по ключу и возвращает объект,
     * соответствующий заданному типу T.
     *
     * @param key ключ в localStorage
     * @param defaultValue опциональное значение по умолчанию (уже строго типизированное)
     * @returns объект, соответствующий типу T (частичный, если данные не полны)
     */
    // eslint-disable-next-line func-names
    return function <K extends keyof T>(
        key: string,
        allowedKeys: K[],
        defaultValue?: Pick<T, K>,
    ): Pick<T, K> {
        const raw = localStorage.getItem(key);
        if (raw === null) {
            return defaultValue ?? ({} as Pick<T, K>);
        }

        let parsed: unknown;
        try {
            parsed = JSON.parse(raw);
        } catch {
            return defaultValue ?? ({} as Pick<T, K>);
        }

        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
            return defaultValue ?? ({} as Pick<T, K>);
        }

        const result: Partial<Pick<T, K>> = {};
        for (const allowedKey of allowedKeys) {
            if (allowedKey in parsed) {
                result[allowedKey] = (parsed as any)[allowedKey];
            }
        }

        return result as Pick<T, K>;
    };
}
