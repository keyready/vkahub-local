type ByteUnit = 'б' | 'Кб' | 'Мб' | 'Гб' | 'ТБ' | 'ПБ';

const UNITS: ByteUnit[] = ['б', 'Кб', 'Мб', 'Гб', 'ТБ', 'ПБ'];
const K = 1024;

export const formatBytes = (
    bytes: number | undefined,
    unit?: ByteUnit,
    returnNumber: boolean = false,
    amplifier: number = 1,
    decimals: number = 2,
): string | number => {
    if (bytes == null || bytes === 0) {
        return returnNumber ? 0 : '0 б';
    }

    const absBytes = Math.abs(bytes * amplifier);

    let index: number;
    if (unit === undefined) {
        index = Math.min(Math.floor(Math.log(absBytes) / Math.log(K)), UNITS.length - 1);
    } else {
        index = UNITS.indexOf(unit);
        if (index === -1) {
            throw new Error(`Invalid unit: "${unit}". Expected one of ${UNITS.join(', ')}`);
        }
    }

    const divisor = K ** index;
    const value = Number(((bytes * amplifier) / divisor).toFixed(decimals));

    return returnNumber ? value : `${value} ${UNITS[index]}`;
};
