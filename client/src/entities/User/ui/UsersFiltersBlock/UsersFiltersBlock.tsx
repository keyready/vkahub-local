import {
    Autocomplete,
    AutocompleteItem,
    AutocompleteSection,
    Checkbox,
    Input,
} from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useSelector } from 'react-redux';
import queryString from 'query-string';
import { useSearchParams } from 'react-router-dom';

import { MembersFilters } from '../../model/types/User';
import { getMembersFilters } from '../../model/selectors/UserSelectors';
import { UserActions } from '../../model/slice/UserSlice';

import classes from './UsersFiltersBlock.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { VStack } from '@/shared/ui/Stack';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';

interface UsersFiltersBlockProps {
    className?: string;
}

export const UsersFiltersBlock = (props: UsersFiltersBlockProps) => {
    const { className } = props;

    const [_, setParams] = useSearchParams();

    const dispatch = useAppDispatch();
    const filters = useSelector(getMembersFilters);

    const [localFilters, setLocalFilters] = useState<MembersFilters>(filters);

    const [debouncedFilters] = useDebounce<MembersFilters>(localFilters, 500);

    useEffect(() => {
        const parsedFilters = queryString.parse(location.search);
        setLocalFilters(parsedFilters);
    }, []);

    useEffect(() => {
        dispatch(UserActions.setMembersFilters(debouncedFilters));
        const stringifiedFilters = queryString.stringify(debouncedFilters);
        setParams(new URLSearchParams(stringifiedFilters));
    }, [debouncedFilters, dispatch, setParams]);

    return (
        <div className={classNames(classes.UsersFiltersBlock, {}, [className])}>
            <form>
                <VStack gap="12px" maxW>
                    <Input
                        value={localFilters.lastname}
                        onChange={(event) =>
                            setLocalFilters({ ...filters, lastname: event.target.value })
                        }
                        size="sm"
                        label="Фамилия"
                    />
                    <Input
                        value={localFilters.username}
                        onChange={(event) =>
                            setLocalFilters({ ...filters, username: event.target.value })
                        }
                        size="sm"
                        label="Юзернейм"
                    />

                    <Autocomplete
                        value={localFilters.wanted}
                        onSelectionChange={(event) =>
                            setLocalFilters({ ...filters, wanted: event as string })
                        }
                        label="Направление"
                        size="sm"
                    >
                        <AutocompleteItem
                            classNames={{
                                title: 'text-main',
                            }}
                            key="frontend"
                        >
                            Frontend
                        </AutocompleteItem>
                        <AutocompleteItem
                            classNames={{
                                title: 'text-main',
                            }}
                            key="uiux"
                        >
                            UI/UX
                        </AutocompleteItem>
                        <AutocompleteItem
                            classNames={{
                                title: 'text-main',
                            }}
                            key="backend"
                        >
                            Backend
                        </AutocompleteItem>
                        <AutocompleteItem
                            classNames={{
                                title: 'text-main',
                            }}
                            key="devops"
                        >
                            DevOps
                        </AutocompleteItem>
                        <AutocompleteItem
                            classNames={{
                                title: 'text-main',
                            }}
                            key="analitics"
                        >
                            Аналитик
                        </AutocompleteItem>
                    </Autocomplete>

                    <Autocomplete
                        value={localFilters.skills}
                        onSelectionChange={(event) =>
                            setLocalFilters({ ...filters, wanted: event as string })
                        }
                        label="Язык/фреймворк"
                        size="sm"
                    >
                        <AutocompleteSection title="Frontend">
                            <AutocompleteItem
                                classNames={{
                                    title: 'text-main',
                                }}
                                key="React"
                            >
                                React
                            </AutocompleteItem>
                            <AutocompleteItem
                                classNames={{
                                    title: 'text-main',
                                }}
                                key="Angular"
                            >
                                Angular
                            </AutocompleteItem>
                            <AutocompleteItem
                                classNames={{
                                    title: 'text-main',
                                }}
                                key="Vue"
                            >
                                Vue
                            </AutocompleteItem>
                        </AutocompleteSection>

                        <AutocompleteSection title="Backend">
                            <AutocompleteItem
                                classNames={{
                                    title: 'text-main',
                                }}
                                key="Golang"
                            >
                                Golang
                            </AutocompleteItem>
                            <AutocompleteItem
                                classNames={{
                                    title: 'text-main',
                                }}
                                key="NodeJs"
                            >
                                NodeJs
                            </AutocompleteItem>
                            <AutocompleteItem
                                classNames={{
                                    title: 'text-main',
                                }}
                                key="Java"
                            >
                                Java
                            </AutocompleteItem>
                        </AutocompleteSection>
                    </Autocomplete>

                    <Checkbox
                        isSelected={!localFilters.isMember}
                        onChange={(event) =>
                            setLocalFilters({ ...filters, isMember: !event.target.checked })
                        }
                    >
                        Ищет команду?
                    </Checkbox>
                </VStack>
            </form>
        </div>
    );
};
