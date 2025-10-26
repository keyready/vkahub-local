import { useCallback, useEffect, useRef, useState } from 'react';
import { Image } from '@nextui-org/react';
import { useSelector } from 'react-redux';

import { EventType } from '../../model/types/Event';

import { classNames } from '@/shared/lib/classNames';
import { useParams } from '@/shared/lib/hooks/useParams';
import { useWindowWidth } from '@/shared/lib/hooks/useWindowWidth';
import { getCurrentTheme } from '@/widgets/ThemeSwitcher';

interface EventsTypeGridProps {
    className?: string;
    setSelectedCategory: (selectedCategory: EventType) => void;
    selectedCategory: EventType | undefined;
}

export const EventsTypeGrid = (props: EventsTypeGridProps) => {
    const { className, setSelectedCategory, selectedCategory } = props;

    const { setParams } = useParams();

    const isDark = useSelector(getCurrentTheme) === 'dark';

    const { isMobile, width } = useWindowWidth();
    const [cardWidth, setCardWidth] = useState<number>(250);

    const imageRef = useRef<HTMLImageElement>(null);

    const handleCategoryClick = useCallback(
        (category: string) => {
            setParams({ category });
            setSelectedCategory(category as EventType);
        },
        [setParams, setSelectedCategory],
    );

    useEffect(() => {
        if (imageRef.current) {
            setCardWidth(imageRef.current.width || 250);
        }
    }, [width, imageRef?.current?.width]);

    if (selectedCategory) {
        return null;
    }

    return (
        <div
            className={classNames(
                'items-center px-10 flex justify-between flex-grow flex-wrap gap-5',
                {},
                [className],
            )}
        >
            <button
                style={{
                    height: cardWidth,
                }}
                onClick={() => handleCategoryClick('hack')}
                type="button"
                className={`relative hover:scale-105 duration-200 cursor-pointer bg-card-bg w-96 ${
                    !isMobile && 'h-96'
                } rounded-3xl flex flex-column items-end justify-center pb-4`}
            >
                <Image
                    classNames={{
                        wrapper: 'absolute top-0 bottom-0 right-0 left-0 w-full',
                    }}
                    src={
                        isDark
                            ? '/static/events-types/hack.webp'
                            : '/static/events-types/hack-light.webp'
                    }
                />
                <h2 className="text-l md:text-xl text-center z-10 font-bold">Хакатоны</h2>
            </button>
            <button
                style={{
                    height: cardWidth,
                }}
                onClick={() => handleCategoryClick('ctf')}
                type="button"
                className={`relative hover:scale-105 duration-200 cursor-pointer bg-card-bg w-96 ${
                    !isMobile && 'h-96'
                } rounded-3xl flex flex-column items-end justify-center pb-4`}
            >
                <Image
                    ref={imageRef}
                    classNames={{
                        wrapper: 'absolute top-0 bottom-0 right-0 left-0 w-full',
                    }}
                    src={
                        isDark
                            ? '/static/events-types/ctf.webp'
                            : '/static/events-types/ctf-light.webp'
                    }
                />
                <h2 className="text-l md:text-xl text-center z-10 font-bold">CTF</h2>
            </button>
            <button
                style={{
                    height: cardWidth,
                }}
                onClick={() => handleCategoryClick('other')}
                type="button"
                className={`relative hover:scale-105 duration-200 cursor-pointer bg-card-bg w-96 ${
                    !isMobile && 'h-96'
                } rounded-3xl flex flex-column items-end justify-center pb-4`}
            >
                <Image
                    classNames={{
                        wrapper: 'absolute top-0 bottom-0 right-0 left-0 w-full',
                    }}
                    src={
                        isDark
                            ? '/static/events-types/other.webp'
                            : '/static/events-types/other-light.webp'
                    }
                />
                <h2 className="text-l md:text-xl text-center z-10 font-bold">
                    Прочие киберсобытия
                </h2>
            </button>
        </div>
    );
};
