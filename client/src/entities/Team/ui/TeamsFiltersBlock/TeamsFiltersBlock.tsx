import { RiCloseLine, RiFilterLine, RiFormatClear } from '@remixicon/react';
import { Button, Input, Slider, Tooltip } from '@nextui-org/react';
import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useSelector } from 'react-redux';

import { TeamsFilters } from '../../model/types/Team';
import { getTeamsFilters } from '../../model/selectors/TeamSelectors';
import { TeamActions } from '../../model/slice/TeamSlice';

import classes from './TeamsFiltersBlock.module.scss';

import { classNames, Mods } from '@/shared/lib/classNames';
import { HStack, VStack } from '@/shared/ui/Stack';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { AutoCompleteTags } from '@/shared/ui/AutoCompleteTags';
import { usePositions } from '@/entities/Positions';

interface TeamsFiltersBlockProps {
    className?: string;
}

export const TeamsFiltersBlock = (props: TeamsFiltersBlockProps) => {
    const { className } = props;

    const [isOpened, setIsOpened] = useState<boolean>(false);

    const filters = useSelector(getTeamsFilters);
    const dispatch = useAppDispatch();

    const { data: positions, isLoading } = usePositions(undefined, {
        refetchOnMountOrArgChange: true,
    });

    const [localFilters, setLocalFilters] = useState<TeamsFilters>(filters);

    const [debouncedFilters] = useDebounce<TeamsFilters>(localFilters, 400);

    useEffect(() => {
        dispatch(TeamActions.setFilters(debouncedFilters));
    }, [debouncedFilters, dispatch]);

    const handleClearFilters = useCallback(() => {
        setLocalFilters({
            title: '',
            members: [1, 10],
            wanted: '',
        });
    }, []);

    const mods: Mods = {
        [classes.opened]: isOpened,
    };

    return (
        <VStack
            gap="12px"
            className={classNames('sticky top-0', mods, [className, classes.TeamsFiltersBlock])}
        >
            <HStack maxW justify="between">
                <Tooltip
                    classNames={{
                        content: 'dark:bg-primary',
                        base: 'dark:before:bg-primary',
                    }}
                    showArrow
                    delay={1000}
                    content={isOpened ? 'Закрыть' : 'Фильтры'}
                >
                    <Button onClick={() => setIsOpened((prevState) => !prevState)}>
                        {isOpened ? <RiCloseLine /> : <RiFilterLine />}
                    </Button>
                </Tooltip>
                {isOpened && (
                    <Tooltip
                        showArrow
                        delay={1000}
                        classNames={{
                            content: 'dark:bg-primary',
                            base: 'dark:before:bg-primary',
                        }}
                        content="Сбросить"
                    >
                        <Button className="bg-red-200" onClick={handleClearFilters}>
                            <RiFormatClear color="red" />
                        </Button>
                    </Tooltip>
                )}
            </HStack>

            {isOpened && (
                <form>
                    <VStack gap="12px" maxW>
                        <Input
                            value={localFilters?.title}
                            onChange={(event) =>
                                setLocalFilters({
                                    ...localFilters,
                                    title: event.target.value,
                                })
                            }
                            size="sm"
                            label="Название команды"
                        />

                        <AutoCompleteTags
                            selectionMode="single"
                            selectedItems={[
                                {
                                    value: localFilters.wanted,
                                    label: localFilters.wanted,
                                },
                            ].filter((item) => item.value)}
                            setSelectedItems={(wanted) =>
                                setLocalFilters({
                                    ...localFilters,
                                    wanted: wanted.filter((item) => item.value)[0].label,
                                })
                            }
                            items={positions}
                            isLoading={isLoading}
                            allowNew={false}
                            placeholder="Выберите позицию"
                            label=""
                        />

                        <Slider
                            value={localFilters?.members || []}
                            onChange={(values) =>
                                setLocalFilters({
                                    ...localFilters,
                                    members: typeof values === 'number' ? [values] : values,
                                })
                            }
                            step={1}
                            label="Участников"
                            defaultValue={[1, 10]}
                            showSteps
                            maxValue={10}
                            minValue={1}
                        />
                    </VStack>
                </form>
            )}
        </VStack>
    );
};
