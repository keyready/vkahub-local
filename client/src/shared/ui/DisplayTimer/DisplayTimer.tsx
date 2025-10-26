import { useEffect, useMemo, useState } from 'react';
import { Display } from 'react-7-segment-display';
import { useSelector } from 'react-redux';

import { classNames } from '@/shared/lib/classNames';
import { HStack, VStack } from '@/shared/ui/Stack';
import { getCurrentTheme } from '@/widgets/ThemeSwitcher';

interface DisplayTimerProps {
    className?: string;
    time: Date | undefined;
}

export const DisplayTimer = (props: DisplayTimerProps) => {
    const { className, time } = props;

    const [registerUntilTimeLeft, setRegisterUntilTimeLeft] = useState<number[]>([0, 0, 0]);

    const isDark = useSelector(getCurrentTheme) === 'dark';

    const renderHoursText = useMemo(() => {
        const getEnding = (num: number): string => {
            if (num >= 10 && num <= 20) return 'часов';
            switch (num % 10) {
                case 1:
                    return 'час';
                case 2:
                case 3:
                case 4:
                    return 'часа';
                default:
                    return 'часов';
            }
        };

        return getEnding(registerUntilTimeLeft[0]);
    }, [registerUntilTimeLeft]);

    const renderMinutesText = useMemo(() => {
        const getEnding = (num: number): string => {
            if (num >= 10 && num <= 20) return 'минут';
            switch (num % 10) {
                case 1:
                    return 'минута';
                case 2:
                case 3:
                case 4:
                    return 'минуты';
                default:
                    return 'минут';
            }
        };

        return getEnding(registerUntilTimeLeft[1]);
    }, [registerUntilTimeLeft]);

    const renderSecondsText = useMemo(() => {
        const getEnding = (num: number): string => {
            if (num >= 10 && num <= 20) return 'секунд';
            switch (num % 10) {
                case 1:
                    return 'секунда';
                case 2:
                case 3:
                case 4:
                    return 'секунды';
                default:
                    return 'секунд';
            }
        };

        return getEnding(registerUntilTimeLeft[2]);
    }, [registerUntilTimeLeft]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        const calculateTimeLeft = () => {
            if (!time) {
                setRegisterUntilTimeLeft([0, 0, 0]);
                return;
            }

            const now = new Date();
            const targetDate: Date = new Date(time);
            const difference = targetDate.getTime() - now.getTime();

            if (difference <= 0) {
                setRegisterUntilTimeLeft([0, 0, 0]);
                clearInterval(intervalId);
                return;
            }

            const hours = Math.floor(difference / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setRegisterUntilTimeLeft([hours, minutes, seconds]);
        };

        calculateTimeLeft();

        intervalId = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(intervalId);
    }, [time]);

    return (
        <HStack maxW className={classNames('mt-3', {}, [className])} gap="24px">
            <VStack align="center" className="p-0">
                <Display
                    count={Math.max(2, registerUntilTimeLeft[0].toString().length)}
                    height={75}
                    value={registerUntilTimeLeft[0].toString()}
                    color={isDark ? '#ff5500' : '#0A2C5C'}
                    skew
                />
                <p className="italic font-bold text-accent">{renderHoursText}</p>
            </VStack>
            <VStack align="center" className="p-0">
                <Display
                    count={2}
                    height={75}
                    value={registerUntilTimeLeft[1].toString()}
                    color={isDark ? '#ff5500' : '#0A2C5C'}
                    skew
                />
                <p className="italic font-bold text-accent">{renderMinutesText}</p>
            </VStack>
            <VStack align="center" className="p-0">
                <Display
                    count={2}
                    height={75}
                    value={registerUntilTimeLeft[2].toString()}
                    color={isDark ? '#ff5500' : '#0A2C5C'}
                    skew
                />
                <p className="italic font-bold text-accent">{renderSecondsText}</p>
            </VStack>
        </HStack>
    );
};
