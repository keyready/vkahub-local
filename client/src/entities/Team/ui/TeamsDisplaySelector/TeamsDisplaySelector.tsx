import { Button, Tooltip } from '@nextui-org/react';
import { RiLayoutGridLine, RiLayoutRowLine, RiRefreshLine } from '@remixicon/react';
import { useSearchParams } from 'react-router-dom';
import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { useTeams } from '../../api/fetchTeamsApi';
import { getTeamsFilters } from '../../model/selectors/TeamSelectors';

import classes from './TeamsDisplaySelector.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { HStack } from '@/shared/ui/Stack';

export type DisplayVariant = 'compact' | 'detailed';

interface TeamsDisplaySelectorProps {
    className?: string;
    selectedDisplay: DisplayVariant;
    setSelectedDisplay: (display: DisplayVariant) => void;
}

export const TeamsDisplaySelector = (props: TeamsDisplaySelectorProps) => {
    const { className, setSelectedDisplay, selectedDisplay } = props;

    const [params, setParams] = useSearchParams();

    const filters = useSelector(getTeamsFilters);

    const { refetch } = useTeams(filters);

    useEffect(() => {
        const initialDisplay = params.get('display');
        if (initialDisplay && ['compact', 'detailed'].includes(initialDisplay as DisplayVariant)) {
            setSelectedDisplay(initialDisplay as DisplayVariant);
        } else {
            setSelectedDisplay('detailed');
            setParams(new URLSearchParams());
        }
    }, [params, setParams, setSelectedDisplay]);

    const handleDisplayChange = useCallback(
        (display: DisplayVariant) => {
            setSelectedDisplay(display);
            const newParams = new URLSearchParams({ display: display as string });
            setParams(newParams);
        },
        [setParams, setSelectedDisplay],
    );

    return (
        <HStack
            className={classNames(classes.TeamsDisplaySelector, {}, [className])}
            justify="end"
            maxW
            gap="12px"
        >
            <Tooltip
                showArrow
                delay={1000}
                classNames={{
                    content: 'dark:bg-primary',
                    base: 'dark:before:bg-primary',
                }}
                content="Компактно"
            >
                <Button
                    onClick={() => handleDisplayChange('compact')}
                    className={selectedDisplay === 'compact' ? 'bg-primary' : ''}
                >
                    <RiLayoutGridLine
                        className={selectedDisplay === 'compact' ? 'text-white' : ''}
                    />
                </Button>
            </Tooltip>

            <Tooltip
                showArrow
                delay={1000}
                classNames={{
                    content: 'dark:bg-primary',
                    base: 'dark:before:bg-primary',
                }}
                content="Подробно"
            >
                <Button
                    onClick={() => handleDisplayChange('detailed')}
                    className={selectedDisplay === 'detailed' ? 'bg-primary' : ''}
                >
                    <RiLayoutRowLine
                        className={selectedDisplay === 'detailed' ? 'text-white' : ''}
                    />
                </Button>
            </Tooltip>

            <Tooltip
                showArrow
                delay={1000}
                classNames={{
                    content: 'dark:bg-primary',
                    base: 'dark:before:bg-primary',
                }}
                content="Обновить"
            >
                <Button className="" onClick={refetch}>
                    <RiRefreshLine className="text-main" />
                </Button>
            </Tooltip>
        </HStack>
    );
};
