import { useCallback } from 'react';
import { OptionRendererProps, ReactTags, Tag } from 'react-tag-autocomplete';
import toast from 'react-hot-toast';
import { RiCheckLine, RiUser2Line } from '@remixicon/react';

import { HStack } from '@/shared/ui/Stack';

interface AutoCompleteTagsProps {
    items?: any[];
    selectedItems: any[];
    setSelectedItems: (items: any[]) => void;
    isDisabled?: boolean;
    allowNew?: boolean;
    isLoading?: boolean;
    placeholder?: string;
    label?: string;
    className?: string;
    selectionMode?: 'multiple' | 'single';
}

export const AutoCompleteTags = (props: AutoCompleteTagsProps) => {
    const {
        label,
        isDisabled,
        className,
        placeholder,
        isLoading,
        items,
        selectedItems,
        setSelectedItems,
        allowNew = true,
        selectionMode = 'multiple',
    } = props;

    const onAdd = useCallback(
        (newTag: Tag) => {
            let isNewTag = false;
            if (items?.length && !items.find((skill) => skill.title === newTag.label)) {
                toast(
                    `Будет добавлен новый элемент: ${newTag.label}. \nПомните про правила сообщества`,
                );
                isNewTag = true;
            }
            if (selectionMode === 'single') {
                setSelectedItems([{ ...newTag, new: isNewTag }]);
            } else setSelectedItems([...selectedItems, { ...newTag, new: isNewTag }]);
        },
        [items, selectionMode, setSelectedItems, selectedItems],
    );

    const onDelete = useCallback(
        (tagIndex: number) => {
            setSelectedItems(selectedItems.filter((_, i) => i !== tagIndex));
        },
        [selectedItems, setSelectedItems],
    );

    const renderOptionsListSuggestions = useCallback(() => {
        if (!items?.length) return [];

        return items?.map((skill) => ({
            label: skill.title,
            value: skill.title,
            author: skill.author,
        }));
    }, [items]);

    const renderOption = useCallback(
        ({ children, classNames, option, ...optionProps }: OptionRendererProps) => {
            const classes = [
                'relative',
                classNames.option,
                option.active ? 'is-active bg-input-hover-bg bg-opacity-40' : '',
                option.selected
                    ? 'is-selected bg-input-hover-bg bg-opacity-40 duration-200'
                    : 'duration-200',
            ];

            return (
                <div className={classes.join(' ')} {...optionProps}>
                    {children}

                    <HStack className="absolute right-2 top-1/2 -translate-y-1/2">
                        {/* @ts-ignore */}
                        {option.author !== 'admin' && <RiUser2Line className="inline" size={14} />}
                        {option.selected && <RiCheckLine />}
                    </HStack>
                </div>
            );
        },
        [],
    );

    return (
        <ReactTags
            placeholderText={placeholder}
            newOptionText="Создать новую запись: %value%"
            renderOption={renderOption}
            isDisabled={isDisabled || isLoading}
            allowNew={allowNew}
            allowBackspace
            classNames={{
                root: `${className} hover:bg-input-hover-bg duration-200 py-1 px-2 relative focus-visible:outline focus-visible:outline-2 focus-visible:outline-input-outline w-full rounded-md bg-input-bg`,
                rootIsActive: '',
                rootIsDisabled: 'opacity-30',
                rootIsInvalid: '',
                label: 'opacity-80 ml-1 text-xs',
                tagList: 'inline gap-2 flex-wrap',
                tagListItem:
                    'mr-2 inline hover:bg-red-200 hover:text-black duration-200 py-1 px-1 rounded-md',
                tag: 'mb-2',
                tagName: '',
                comboBox: 'inline w-full',
                input: 'ml-2 w-fit inline bg-transparent outline-none focus-visible-none',
                listBox:
                    'z-50 outline outline-1 outline-gray-400 w-[98%] absolute p-4 bg-listbox-bg text-primary rounded-xl max-h-[300px] overflow-y-auto',
                option: 'mb-1 p-1 px-2 py-1 rounded-md hover:bg-input-hover-bg cursor-pointer',
                optionIsActive: 'bg-input-hover-bg',
                highlight: 'p-1 rounded-md bg-green-900 text-primary',
            }}
            labelText={label}
            selected={selectedItems}
            suggestions={renderOptionsListSuggestions()}
            onAdd={onAdd}
            onDelete={onDelete}
            noOptionsText="Нет подходящих вариантов"
        />
    );
};
