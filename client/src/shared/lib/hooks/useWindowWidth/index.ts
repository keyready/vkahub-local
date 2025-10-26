import { useWindowSize } from '@uidotdev/usehooks';
import { useEffect, useState } from 'react';

export function useWindowWidth() {
    const { width: windowWidth } = useWindowSize();

    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        if (windowWidth && windowWidth < 768) {
            setIsMobile(true);
        }
    }, [windowWidth]);

    return {
        width: windowWidth ?? 0,
        isMobile,
    };
}
