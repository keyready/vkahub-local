import { Button, Input, Modal, ModalContent, Textarea } from '@nextui-org/react';
import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { createTeamSchema, CreateTeamTypes } from '../../model/types/validationSchemas';

import classes from './CreateTeamForm.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { HStack, VStack } from '@/shared/ui/Stack';
import { toastDispatch } from '@/widgets/Toaster';
import { createTeam, getTeamIsLoading } from '@/entities/Team';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { ImageUpload } from '@/shared/ui/ImageUpload/ui/ImageUpload';
import { getUserDataService } from '@/entities/User';

interface CreateTeamFormProps {
    className?: string;
    isOpened: boolean;
    setIsOpened: (state: boolean) => void;
}

export const CreateTeamForm = (props: CreateTeamFormProps) => {
    const { className, setIsOpened, isOpened } = props;

    const dispatch = useAppDispatch();

    const isTeamCreating = useSelector(getTeamIsLoading);

    const [file, setFile] = useState<File>();
    const [imageHash, setImageHash] = useState<string>('');

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm<CreateTeamTypes>({
        resolver: yupResolver(createTeamSchema),
    });

    const handleChangeAvatar = useCallback((avatar: File) => {
        setFile(avatar);
    }, []);

    const handleCloseForm = useCallback(() => {
        setIsOpened(false);
        reset();
    }, [reset, setIsOpened]);

    const handleFormSubmit = useCallback(
        async (team: CreateTeamTypes) => {
            const formData = new FormData();
            if (file) formData.append('image', file);
            formData.append('title', team.title);
            formData.append('hash', imageHash);
            formData.append('description', team.description);

            const result = await toastDispatch(dispatch(createTeam(formData)));

            if (result.meta.requestStatus === 'fulfilled') {
                setIsOpened(false);
                reset();
                await dispatch(getUserDataService());
            }
        },
        [file, imageHash, dispatch, setIsOpened, reset],
    );

    return (
        <Modal
            size="3xl"
            backdrop="blur"
            isDismissable={!isTeamCreating}
            hideCloseButton={isTeamCreating}
            isOpen={isOpened}
            onClose={handleCloseForm}
        >
            <ModalContent className="p-8 bg-grad-end dark:bg-card-bg">
                <VStack
                    gap="24px"
                    maxW
                    className={classNames(classes.CreateTeamForm, {}, [className])}
                >
                    <h1 className="text-primary text-l text-center w-full">
                        Создайте <span className="font-bold">свою</span> команду и покоряйте новые{' '}
                        <span className="font-bold">высоты</span>!
                    </h1>
                    <form onSubmit={handleSubmit(handleFormSubmit)}>
                        <HStack maxW align="start" gap="24px">
                            <ImageUpload
                                onImageHashGenerated={setImageHash}
                                isLoading={isTeamCreating}
                                onChange={handleChangeAvatar}
                            />
                            <VStack maxW gap="12px">
                                <Controller
                                    render={({ field }) => (
                                        <Input
                                            isDisabled={isTeamCreating}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            size="sm"
                                            label="Название команды"
                                            isInvalid={Boolean(errors.title?.message)}
                                            errorMessage={errors.title?.message}
                                        />
                                    )}
                                    name="title"
                                    control={control}
                                />
                                <Controller
                                    render={({ field }) => (
                                        <Textarea
                                            isDisabled={isTeamCreating}
                                            classNames={{
                                                inputWrapper: 'h-full',
                                            }}
                                            minRows={6}
                                            maxRows={6}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            label="Описание команды"
                                            isInvalid={Boolean(errors.description?.message)}
                                            errorMessage={errors.description?.message}
                                        />
                                    )}
                                    name="description"
                                    control={control}
                                />
                                <Button
                                    isDisabled={!file || isTeamCreating}
                                    isLoading={isTeamCreating}
                                    className="self-end"
                                    size="sm"
                                    type="submit"
                                >
                                    {isTeamCreating ? 'Ожидайте...' : 'Создать команду'}
                                </Button>
                            </VStack>
                        </HStack>
                    </form>
                </VStack>
            </ModalContent>
        </Modal>
    );
};
