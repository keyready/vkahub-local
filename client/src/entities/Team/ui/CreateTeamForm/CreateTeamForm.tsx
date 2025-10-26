import { Button, Input, Modal, ModalContent, Textarea } from '@nextui-org/react';
import { FormEvent, useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

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

    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [file, setFile] = useState<File>();

    const isButtonDisabled = useMemo(
        () => !title || !description || isTeamCreating,
        [description, isTeamCreating, title],
    );

    const handleChangeAvatar = useCallback((avatar: File) => {
        setFile(avatar);
    }, []);

    const handleCloseForm = useCallback(() => {
        setIsOpened(false);
    }, [setIsOpened]);

    const handleFormSubmit = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            const formData = new FormData();
            if (file) formData.append('image', file);
            formData.append('title', title);
            formData.append('description', description);

            const result = await toastDispatch(dispatch(createTeam(formData)));

            if (result.meta.requestStatus === 'fulfilled') {
                setIsOpened(false);
                await dispatch(getUserDataService());
            }
        },
        [description, dispatch, file, setIsOpened, title],
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
                    <form onSubmit={handleFormSubmit}>
                        <HStack maxW align="start" gap="24px">
                            <ImageUpload isLoading={isTeamCreating} onChange={handleChangeAvatar} />
                            <VStack maxW gap="12px">
                                <Input
                                    isDisabled={isTeamCreating}
                                    value={title}
                                    onChange={(event) => setTitle(event.target.value)}
                                    size="sm"
                                    label="Название команды"
                                />
                                <Textarea
                                    isDisabled={isTeamCreating}
                                    classNames={{
                                        inputWrapper: 'h-full',
                                    }}
                                    minRows={6}
                                    maxRows={6}
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                    label="Описание команды"
                                />
                                <Button
                                    isDisabled={isButtonDisabled}
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
