import { Button, Textarea } from '@nextui-org/react';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { Bug } from '../../model/types/Bug';
import { getIsBugCreating } from '../../model/selectors/BugSelectors';

import classes from './CreateBugReportForm.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { VStack } from '@/shared/ui/Stack';
import { MultiplyFilesInput } from '@/shared/ui/MultiplyFilesInput';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { toastDispatch } from '@/widgets/Toaster';
import { createBugReport } from '@/entities/Bug';

interface CreateBugReportFormProps {
    className?: string;
    from?: string;
}

export const CreateBugReportForm = (props: CreateBugReportFormProps) => {
    const { className, from } = props;

    const dispatch = useAppDispatch();

    const isBugReporting = useSelector(getIsBugCreating);

    const [newBugReport, setNewBugReport] = useState<Partial<Bug>>({});
    const [files, setFiles] = useState<File[]>([]);

    useEffect(() => {
        setNewBugReport((prevState) => ({
            ...prevState,
            description: `Я получил ошибку, находясь на странице ${from}`,
        }));
    }, [from]);

    const isButtonDisabled = useMemo(
        () =>
            isBugReporting ||
            !newBugReport.description ||
            !newBugReport.produce ||
            !newBugReport.expected ||
            !newBugReport.additional ||
            !files?.length,
        [isBugReporting, newBugReport, files],
    );

    const handleSubmitForm = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            const formData = new FormData();
            files.forEach((file) => formData.append('media', file));

            Object.entries(newBugReport).forEach(([key, value]) => {
                formData.append(key, value.toString());
            });

            await toastDispatch(dispatch(createBugReport(formData)), {
                loading: 'Записываем...',
                success: 'Это не баг, а фича!',
                error: 'ОЙ, тут тоже баги)',
            });
        },
        [dispatch, newBugReport, files],
    );

    return (
        <VStack
            maxW
            gap="18px"
            className={classNames(classes.CreateBugReportForm, {}, [className])}
        >
            <VStack maxW gap="0">
                <h1 className="text-l">Если Вы заметили неисправность — доложите рапортом</h1>
                <p className="opacity-50 italic">
                    На этой странице Вы можете сообщить о замеченных проблемах и ошибках, с которыми
                    Вы столкнулись во время пользованием сайта.
                </p>
            </VStack>
            <form onSubmit={handleSubmitForm}>
                <VStack maxW gap="12px">
                    <Textarea
                        isDisabled={isBugReporting}
                        minRows={4}
                        classNames={{
                            inputWrapper: 'h-auto',
                        }}
                        isRequired
                        value={newBugReport.description}
                        onChange={(event) =>
                            setNewBugReport((prevState) => ({
                                ...prevState,
                                description: event.target.value,
                            }))
                        }
                        label="Описание проблемы"
                    />
                    <Textarea
                        isDisabled={isBugReporting}
                        isRequired
                        value={newBugReport.produce}
                        onChange={(event) =>
                            setNewBugReport((prevState) => ({
                                ...prevState,
                                produce: event.target.value,
                            }))
                        }
                        classNames={{
                            inputWrapper: 'h-auto',
                        }}
                        minRows={4}
                        label="Как повторить"
                    />
                    <Textarea
                        isDisabled={isBugReporting}
                        minRows={4}
                        classNames={{
                            inputWrapper: 'h-auto',
                        }}
                        isRequired
                        value={newBugReport.expected}
                        onChange={(event) =>
                            setNewBugReport((prevState) => ({
                                ...prevState,
                                expected: event.target.value,
                            }))
                        }
                        label="Ожидаемое поведение"
                    />
                    <Textarea
                        isDisabled={isBugReporting}
                        minRows={4}
                        classNames={{
                            inputWrapper: 'h-auto',
                        }}
                        isRequired
                        value={newBugReport.additional}
                        onChange={(event) =>
                            setNewBugReport((prevState) => ({
                                ...prevState,
                                additional: event.target.value,
                            }))
                        }
                        label="Дополнительно"
                    />
                    <MultiplyFilesInput
                        isDisabled={isBugReporting}
                        files={files}
                        onChange={setFiles}
                    />

                    <Button
                        type="submit"
                        isLoading={isBugReporting}
                        isDisabled={isButtonDisabled}
                        className="self-end"
                    >
                        {isBugReporting ? 'Ожидайте...' : 'Отправить!'}
                    </Button>
                </VStack>
            </form>
        </VStack>
    );
};
