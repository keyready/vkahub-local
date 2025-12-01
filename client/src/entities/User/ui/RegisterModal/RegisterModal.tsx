import { Button, Input, Modal, ModalContent } from '@nextui-org/react';
import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RiEyeLine } from '@remixicon/react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { registrationSchema } from '../../model/types/validationSchemas';

import { classNames } from '@/shared/lib/classNames';
import { HStack, VStack } from '@/shared/ui/Stack';
import { ImageUpload } from '@/shared/ui/ImageUpload/ui/ImageUpload';
import { getUserAuthError, getUserIsLoading, signupUser, UserActions } from '@/entities/User';
import { toastDispatch } from '@/widgets/Toaster';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';

interface RegisterModalProps {
    className?: string;
    isOpened: boolean;
    setIsOpened: (state: boolean) => void;
}

export const RegisterModal = (props: RegisterModalProps) => {
    const { className, isOpened, setIsOpened } = props;

    const dispatch = useAppDispatch();

    const userAuthError = useSelector(getUserAuthError);
    const isLoading = useSelector(getUserIsLoading);

    const [file, setFile] = useState<File>();
    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<{ username: string; password: string }>({
        resolver: yupResolver(registrationSchema),
        mode: 'onChange',
    });

    const renderAuthErrorText = useMemo(() => {
        switch (userAuthError) {
            case 'Invalid password':
                return 'Неверный пароль!';
            case 'User with this username or mail already exists':
                return 'Пользователь с такими данными уже существует!';
            default:
                return 'Неопознанная ошибка';
        }
    }, [userAuthError]);

    const handleFormSubmit = useCallback(
        async (user: { username: string; password: string }) => {
            if (!file) return;

            const formData = new FormData();
            formData.append('avatar', file);
            formData.append('username', user.username);
            formData.append('password', user.password);

            const result = await toastDispatch(dispatch(signupUser(formData)), {
                loading: 'Отправляем данные',
                error: 'Произошла ошибка',
                success: 'Вы успешно зарегистрированы',
            });

            if (result.meta.requestStatus === 'fulfilled') {
                setIsOpened(false);
                dispatch(UserActions.clearAuthError());
            }
        },
        [setIsOpened, dispatch, file],
    );

    const handleChangeAvatar = useCallback((avatar: File) => {
        setFile(avatar);
    }, []);

    const handleCloseForm = useCallback(() => {
        setIsOpened(false);
        setFile(undefined);
    }, [setIsOpened]);

    return (
        <Modal
            size="3xl"
            backdrop="blur"
            isDismissable={!isLoading}
            hideCloseButton={isLoading}
            isOpen={isOpened}
            onClose={handleCloseForm}
        >
            <ModalContent className="p-8 bg-grad-end dark:bg-card-bg">
                <VStack
                    className={classNames('', {}, [className])}
                    maxW
                    align="center"
                    flexGrow
                    justify="center"
                >
                    <form onSubmit={handleSubmit(handleFormSubmit)}>
                        <VStack maxW align="center" gap="24px">
                            <h1 className="text-2xl text-main">
                                <span className="font-bold">Зарегистрируйтесь</span> прямо сейчас
                            </h1>
                            <HStack maxW align="start" gap="24px">
                                <ImageUpload isLoading={isLoading} onChange={handleChangeAvatar} />

                                <VStack maxW gap="12px">
                                    <Controller
                                        render={({ field }) => (
                                            <Input
                                                isDisabled={isLoading}
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                autoFocus
                                                required
                                                label="Придумайте логин"
                                                isInvalid={Boolean(errors.username?.message)}
                                                errorMessage={errors.username?.message}
                                                classNames={{
                                                    errorMessage: 'text-red-400 font-bold',
                                                }}
                                            />
                                        )}
                                        name="username"
                                        control={control}
                                    />

                                    <Controller
                                        render={({ field }) => (
                                            <Input
                                                endContent={
                                                    <Button
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            setIsPasswordVisible(
                                                                (prevState) => !prevState,
                                                            );
                                                        }}
                                                        variant="ghost"
                                                        className="p-0 min-w-0 min-h-0 border-none translate-y-1"
                                                    >
                                                        <RiEyeLine size={16} color="white" />
                                                    </Button>
                                                }
                                                isDisabled={isLoading}
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                required
                                                isInvalid={Boolean(errors.password?.message)}
                                                errorMessage={errors.password?.message}
                                                type={isPasswordVisible ? 'text' : 'password'}
                                                label="Придумайте пароль"
                                                classNames={{
                                                    errorMessage: 'text-red-400 font-bold',
                                                }}
                                            />
                                        )}
                                        name="password"
                                        control={control}
                                    />

                                    {userAuthError && (
                                        <p className="text-left w-full italic text-red-500">
                                            {renderAuthErrorText}
                                        </p>
                                    )}

                                    <Button
                                        isLoading={isLoading}
                                        isDisabled={!isValid || !file}
                                        type="submit"
                                        className="text-white dark:text-black bg-accent self-end"
                                    >
                                        {isLoading ? 'Ожидайте...' : 'Зарегистрироваться!'}
                                    </Button>
                                </VStack>
                            </HStack>
                        </VStack>
                    </form>
                </VStack>
            </ModalContent>
        </Modal>
    );
};
