import React, { ChangeEvent, FormEvent, useCallback, useState } from 'react';
import {
    Autocomplete,
    AutocompleteItem,
    Button,
    DatePicker,
    DateRangePicker,
    DateValue,
    Input,
    Modal,
    ModalContent,
    RangeValue,
    Textarea,
} from '@nextui-org/react';
import { I18nProvider } from '@react-aria/i18n';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { getLocalTimeZone, today } from '@internationalized/date';

import { Event, EventType } from '../../../model/types/Event';
import { createEvent } from '../../../model/services/createEvent';
import { getParsedEventData } from '../../../model/selectors/EventSeceltors';

import classes from './CreateEventForm.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { toastDispatch } from '@/widgets/Toaster';
import { HStack, VStack } from '@/shared/ui/Stack';
import { ImageUpload } from '@/shared/ui/ImageUpload';

interface CreateEventFormProps {
    className?: string;
}

export const CreateEventForm = (props: CreateEventFormProps) => {
    const { className } = props;

    const dispatch = useAppDispatch();
    const parsedEvent = useSelector(getParsedEventData);

    const [value, setValue] = useState<RangeValue<DateValue>>();
    const [registerUntilDate, setRegisterUntilDate] = useState<DateValue>();
    const [sponsors, setSponsors] = useState<string>('');
    const [file, setFile] = useState<File>();

    const [newEvent, setNewEvent] = useState<Partial<Event>>({});
    const [isOpened, setIsOpened] = useState<boolean>(false);

    const handleSponsorsChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            setSponsors(event.target.value);
            setNewEvent({
                ...newEvent,
                // @ts-ignore
                sponsors: event.target.value.replace(', ', ','),
            });
        },
        [newEvent],
    );

    const handleFileChange = useCallback((file: File) => {
        setFile(file);
    }, []);

    const handleFormSubmit = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            if (!file) {
                toast.error('Необходимо выбрать файл');
                return;
            }

            const temp: Omit<Partial<Event>, 'startDate' | 'finishDate' | 'registerUntil'> & {
                startDate: string;
                finishDate: string;
                registerUntil: string;
            } = {
                ...newEvent,
                startDate: new Date(
                    `${value?.start.year}-${value?.start.month}-${value?.start.day}`,
                ).toISOString(),
                finishDate: new Date(
                    `${value?.end.year}-${value?.end.month}-${value?.end.day}`,
                ).toISOString(),
                registerUntil: new Date(
                    `${registerUntilDate?.year}-${registerUntilDate?.month}-${registerUntilDate?.day}`,
                ).toISOString(),
            };

            const formData = new FormData();
            formData.append('image', file);
            Object.entries(temp).forEach(([key, value]) => {
                formData.append(key, value.toString());
            });

            const result = await toastDispatch(dispatch(createEvent(formData)), {
                loading: 'Создание события...',
                success: 'Событие успешно создано!',
                error: 'Ошибка при создании события!',
            });

            if (result.meta.requestStatus === 'fulfilled') {
                setNewEvent({});
            }
        },
        [
            dispatch,
            file,
            newEvent,
            registerUntilDate?.day,
            registerUntilDate?.month,
            registerUntilDate?.year,
            value?.end.day,
            value?.end.month,
            value?.end.year,
            value?.start.day,
            value?.start.month,
            value?.start.year,
        ],
    );

    return (
        <VStack gap="24px" maxW className={classNames(classes.CreateEventForm, {}, [className])}>
            <Modal backdrop="blur" size="5xl" isOpen={isOpened} onClose={() => setIsOpened(false)}>
                <ModalContent className="p-5 bg-grad-end dark:bg-card-bg">
                    <VStack maxW gap="12px">
                        <h1 className="text-l text-primary">Результат парсера</h1>
                        {parsedEvent?.split('\\n').map((line, index) => (
                            <p
                                className="text-primary py-1 px-2 bg-gray-800 rounded-md"
                                key={index}
                            >
                                {line}
                            </p>
                        ))}
                    </VStack>
                </ModalContent>
            </Modal>

            <HStack maxW justify="between">
                <h1 className="text-l">Ручное добавление</h1>
                {parsedEvent && (
                    <Button onClick={() => setIsOpened(true)}>Открыть результат парсера</Button>
                )}
            </HStack>

            <form onSubmit={handleFormSubmit}>
                <VStack maxW gap="12px">
                    <HStack maxW align="start" gap="24px">
                        <ImageUpload onChange={handleFileChange} />
                        <VStack maxW gap="12px">
                            <Input
                                value={newEvent.title}
                                onChange={(event) =>
                                    setNewEvent({
                                        ...newEvent,
                                        title: event.target.value,
                                    })
                                }
                                label="Название события"
                            />
                            <Input
                                label="Спонсоры соревнований"
                                value={sponsors}
                                onChange={handleSponsorsChange}
                            />
                        </VStack>
                    </HStack>
                    <Textarea
                        classNames={{
                            inputWrapper: 'h-auto',
                        }}
                        minRows={4}
                        value={newEvent.description}
                        onChange={(event) =>
                            setNewEvent({
                                ...newEvent,
                                description: event.target.value,
                            })
                        }
                        label="Описание события"
                    />
                    <Textarea
                        classNames={{
                            inputWrapper: 'h-auto',
                        }}
                        minRows={4}
                        value={newEvent.shortDescription}
                        onChange={(event) =>
                            setNewEvent({
                                ...newEvent,
                                shortDescription: event.target.value,
                            })
                        }
                        label="Краткое описание события"
                    />
                    <I18nProvider>
                        <DateRangePicker
                            fullWidth={false}
                            radius="md"
                            disableAnimation={false}
                            minValue={today(getLocalTimeZone())}
                            labelPlacement="inside"
                            isDisabled={false}
                            size="md"
                            visibleMonths={2}
                            label="Даты проведения события"
                            value={value}
                            onChange={setValue}
                        />
                        <DatePicker
                            minValue={today(getLocalTimeZone())}
                            labelPlacement="inside"
                            isDisabled={false}
                            size="md"
                            label="Регистрация до"
                            value={registerUntilDate}
                            onChange={setRegisterUntilDate}
                        />
                    </I18nProvider>
                    <Autocomplete
                        value={newEvent.type}
                        onSelectionChange={(event) => {
                            setNewEvent({
                                ...newEvent,
                                type: event as EventType,
                            });
                        }}
                        label="Тип события"
                    >
                        <AutocompleteItem key="ctf">CTF</AutocompleteItem>
                        <AutocompleteItem key="hack">Хакатон</AutocompleteItem>
                        <AutocompleteItem key="other">Другое</AutocompleteItem>
                    </Autocomplete>

                    <Button className="self-end" type="submit" size="sm">
                        Создать событие
                    </Button>
                </VStack>
            </form>
        </VStack>
    );
};
