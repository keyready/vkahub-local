import { Autocomplete, AutocompleteItem } from '@nextui-org/react';
import { useSelector } from 'react-redux';
import { Key, useCallback, useEffect, useState } from 'react';

import { getRecoveryQuestions } from '../../model/selectors/UserSelectors';

interface RecoveryQuestionSelectorProps {
    value: string;
    onChange: (rq: string) => void;
    isDisabled?: boolean;
}

export const RecoveryQuestionSelector = (props: RecoveryQuestionSelectorProps) => {
    const { onChange, value, isDisabled } = props;

    const questions = useSelector(getRecoveryQuestions);

    const [selected, setSelected] = useState<number>(-1);

    useEffect(() => {
        const foundQuestionId = questions.find((q) => q.question === value);
        if (foundQuestionId) {
            setSelected(foundQuestionId.id);
        }
    }, [questions, value]);

    const handleSelectionChange = useCallback(
        (ss: Key | null) => {
            if (ss) {
                onChange(ss as string);
            }
        },
        [onChange],
    );

    return (
        <Autocomplete
            isDisabled={isDisabled}
            size="sm"
            label="Контрольный вопрос"
            isRequired
            defaultItems={questions}
            selectedKey={value}
            onSelectionChange={handleSelectionChange}
            listboxProps={{
                disallowEmptySelection: true,
                emptyContent: 'Вопросы не найдены, т.к. сервера недоступны. Попробуйте позже',
                itemClasses: {
                    title: 'dark:text-white',
                },
            }}
        >
            {({ question }) => <AutocompleteItem key={question}>{question}</AutocompleteItem>}
        </Autocomplete>
    );
};
