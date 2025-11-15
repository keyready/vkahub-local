export function sortByPlace<T extends { place: string }>(a: T, b: T): number {
    const order: Record<string, number> = {
        '1st': 0,
        '2nd': 1,
        '3rd': 2,
        'participant': 3,
    };

    const aIndex = order[a.place] ?? Infinity;
    const bIndex = order[b.place] ?? Infinity;

    return aIndex - bIndex;
}
