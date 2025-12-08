import React, { useCallback, useState } from 'react';
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
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { createEvent } from '../../../model/services/createEvent';
import { getParsedEventData } from '../../../model/selectors/EventSeceltors';
import {
    CreateEventTypes,
    createEventValidationSchema,
} from '../../../model/types/validationSchema';

import classes from './CreateEventForm.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { toastDispatch } from '@/widgets/Toaster';
import { HStack, VStack } from '@/shared/ui/Stack';
import { ImageUpload } from '@/shared/ui/ImageUpload';
import { objectToFormData } from '@/shared/lib/objFormdata';

interface CreateEventFormProps {
    className?: string;
}

export const CreateEventForm = (props: CreateEventFormProps) => {
    const { className } = props;

    const dispatch = useAppDispatch();
    const parsedEvent = useSelector(getParsedEventData);

    const [eventsDates, setEventsDates] = useState<RangeValue<DateValue>>();
    const [registerUntilDate, setRegisterUntilDate] = useState<DateValue>();
    const [file, setFile] = useState<File>();
    const [imageHash, setImageHash] = useState<string>('');

    const [isOpened, setIsOpened] = useState<boolean>(false);

    const {
        handleSubmit,
        formState: { errors },
        reset,
        control,
    } = useForm<CreateEventTypes>({
        resolver: yupResolver(createEventValidationSchema),
    });

    const handleFileChange = useCallback((file: File) => {
        setFile(file);
    }, []);

    const handleFormSubmit = useCallback(
        async (event: CreateEventTypes) => {
            if (!file) {
                toast.error('Необходимо выбрать файл');
                return;
            }

            if (!eventsDates?.start || !eventsDates?.end || !registerUntilDate) {
                toast.error('Вы не выбрали даты проведения');
                return;
            }

            const formData = objectToFormData(event);
            formData.append('image', file);
            formData.append('hash', imageHash);
            formData.append('startDate', new Date(eventsDates?.start.toString()).toISOString());
            formData.append('finishDate', new Date(eventsDates?.end.toString()).toISOString());
            formData.append('registerUntil', new Date(registerUntilDate?.toString()).toISOString());

            const result = await toastDispatch(dispatch(createEvent(formData)), {
                loading: 'Создание события...',
                success: 'Событие успешно создано!',
                error: 'Ошибка при создании события!',
            });

            if (result.meta.requestStatus === 'fulfilled') {
                reset();
            }
        },
        [file, imageHash, eventsDates, registerUntilDate, dispatch, reset],
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

            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <VStack maxW gap="12px">
                    <HStack maxW align="start" gap="24px">
                        <ImageUpload
                            onImageHashGenerated={setImageHash}
                            onChange={handleFileChange}
                        />
                        <VStack maxW gap="12px">
                            <Controller
                                render={({ field }) => (
                                    <Input
                                        isRequired
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        label="Название события"
                                        isInvalid={Boolean(errors.title?.message)}
                                        errorMessage={errors.title?.message}
                                    />
                                )}
                                name="title"
                                control={control}
                            />
                            <Controller
                                render={({ field }) => (
                                    <Input
                                        isRequired
                                        value={field.value}
                                        onValueChange={(val) =>
                                            field.onChange(val.replace(', ', ','))
                                        }
                                        label="Спонсоры соревнований"
                                        isInvalid={Boolean(errors.sponsors?.message)}
                                        errorMessage={errors.sponsors?.message}
                                    />
                                )}
                                name="sponsors"
                                control={control}
                            />
                        </VStack>
                    </HStack>

                    <Controller
                        render={({ field }) => (
                            <Textarea
                                isRequired
                                classNames={{
                                    inputWrapper: 'h-auto',
                                }}
                                minRows={4}
                                label="Описание события"
                                value={field.value}
                                onValueChange={field.onChange}
                                isInvalid={Boolean(errors.description?.message)}
                                errorMessage={errors.description?.message}
                            />
                        )}
                        name="description"
                        control={control}
                    />

                    <Controller
                        render={({ field }) => (
                            <Textarea
                                isRequired
                                classNames={{
                                    inputWrapper: 'h-auto',
                                }}
                                minRows={4}
                                label="Краткое описание события"
                                value={field.value}
                                onValueChange={field.onChange}
                                isInvalid={Boolean(errors.shortDescription?.message)}
                                errorMessage={errors.shortDescription?.message}
                            />
                        )}
                        name="shortDescription"
                        control={control}
                    />

                    <I18nProvider>
                        <DateRangePicker
                            isRequired
                            fullWidth={false}
                            radius="md"
                            minValue={today(getLocalTimeZone())}
                            labelPlacement="inside"
                            size="md"
                            visibleMonths={2}
                            label="Даты проведения события"
                            value={eventsDates}
                            onChange={setEventsDates}
                        />
                        <DatePicker
                            isRequired
                            minValue={today(getLocalTimeZone())}
                            labelPlacement="inside"
                            size="md"
                            label="Регистрация до"
                            value={registerUntilDate}
                            onChange={setRegisterUntilDate}
                        />
                    </I18nProvider>

                    <Controller
                        render={({ field }) => (
                            <Autocomplete
                                isRequired
                                value={field.value}
                                onSelectionChange={field.onChange}
                                label="Тип события"
                                isInvalid={Boolean(errors.type?.message)}
                                errorMessage={errors.type?.message}
                                listboxProps={{
                                    itemClasses: {
                                        title: 'dark:text-white',
                                    },
                                }}
                            >
                                <AutocompleteItem key="ctf">CTF</AutocompleteItem>
                                <AutocompleteItem key="hack">Хакатон</AutocompleteItem>
                                <AutocompleteItem key="other">Другое</AutocompleteItem>
                            </Autocomplete>
                        )}
                        name="type"
                        control={control}
                    />

                    <Button className="self-end" type="submit" size="sm">
                        Создать событие
                    </Button>
                </VStack>
            </form>
        </VStack>
    );
};
