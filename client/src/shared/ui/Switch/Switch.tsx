// src/components/SwitchTabs.tsx
import { cn } from '@nextui-org/react';
import { useCallback, useEffect, useRef, useState } from 'react';

export type SwitchOption<T = string> = {
    value: T;
    label: string;
};

export interface SwitchTabsProps<T = string> {
    options: SwitchOption<T>[];
    value: T;
    onChange: (value: T) => void;
    className?: string;
    buttonClassName?: string;
    sliderClassName?: string;
    disabledKeys?: T[];
}

export const Switch = <T extends string>({
    options,
    value,
    onChange,
    className,
    buttonClassName,
    sliderClassName,
    disabledKeys,
}: SwitchTabsProps<T>) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });

    const updateSliderPosition = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        const buttons = Array.from(container.querySelectorAll('button'));
        const activeIndex = options.findIndex((opt) => opt.value === value);
        if (activeIndex === -1) return;

        const activeButton = buttons[activeIndex];
        if (!activeButton) return;

        const buttonRect = activeButton.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        setSliderStyle({
            left: buttonRect.left - containerRect.left,
            width: buttonRect.width,
        });
    }, [options, value]);

    useEffect(() => {
        updateSliderPosition();
        const observer = new ResizeObserver(updateSliderPosition);
        if (containerRef.current) {
            observer.observe(containerRef.current);
            Array.from(containerRef.current.querySelectorAll('button')).forEach((btn) =>
                observer.observe(btn),
            );
        }
        return () => observer.disconnect();
    }, [updateSliderPosition]);

    return (
        <div
            ref={containerRef}
            className={cn(
                'relative flex h-8 items-center rounded-lg bg-default-100 p-1',
                className,
            )}
        >
            {options.map((option) => (
                <button
                    disabled={disabledKeys?.includes(option.value)}
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                    className={cn(
                        'z-10 cursor-pointer rounded-lg px-3 py-1 text-center text-sm font-medium transition-colors',
                        value === option.value
                            ? 'text-black dark:text-white'
                            : 'dark:text-gray-500 text-black/30',
                        buttonClassName,
                        disabledKeys?.includes(option.value) ? 'opacity-30 cursor-not-allowed' : '',
                    )}
                >
                    {option.label}
                </button>
            ))}
            <span
                className={cn(
                    'absolute top-1 h-6 rounded-lg bg-grad-end dark:bg-default transition-all duration-300',
                    sliderClassName,
                )}
                style={{
                    left: sliderStyle.left,
                    width: sliderStyle.width,
                }}
            />
        </div>
    );
};
