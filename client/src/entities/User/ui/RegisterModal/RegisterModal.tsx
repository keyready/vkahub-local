import { Button, Input, Modal, ModalContent } from '@nextui-org/react';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { RiEyeLine } from '@remixicon/react';

import { classNames } from '@/shared/lib/classNames';
import { HStack, VStack } from '@/shared/ui/Stack';
import { ImageUpload } from '@/shared/ui/ImageUpload/ui/ImageUpload';
import { getUserAuthError, getUserIsLoading, signupUser, User, UserActions } from '@/entities/User';
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

    const [newUserObj, setNewUserObj] = useState<User>({});
    const [file, setFile] = useState<File>();
    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

    const isFormValidated = useMemo(
        () => newUserObj.password && newUserObj.username && file,
        [file, newUserObj.password, newUserObj.username],
    );

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

    useEffect(() => {
        dispatch(UserActions.clearAuthError());
    }, [dispatch, newUserObj]);

    const handleFormSubmit = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            if (!isFormValidated) toast.error('Заполните все поля формы!');
            if (!file) return;

            const formData = new FormData();
            formData.append('avatar', file);
            Object.entries(newUserObj).forEach(([key, value]) => {
                formData.append(key, value.toString());
            });

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
        [setIsOpened, dispatch, file, isFormValidated, newUserObj],
    );

    const handleChangeAvatar = useCallback((avatar: File) => {
        setFile(avatar);
    }, []);

    const handleCloseForm = useCallback(() => {
        setIsOpened(false);
        setNewUserObj({});
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
                    <form onSubmit={handleFormSubmit}>
                        <VStack maxW align="center" gap="24px">
                            <h1 className="text-2xl text-main">
                                <span className="font-bold">Зарегистрируйтесь</span> прямо сейчас
                            </h1>
                            <HStack maxW align="start" gap="24px">
                                <ImageUpload isLoading={isLoading} onChange={handleChangeAvatar} />
                                <VStack maxW gap="12px">
                                    <Input
                                        isDisabled={isLoading}
                                        onChange={(event) =>
                                            setNewUserObj({
                                                ...newUserObj,
                                                username: event.target.value,
                                            })
                                        }
                                        value={newUserObj.username}
                                        autoFocus
                                        required
                                        label="Придумайте логин"
                                    />
                                    <Input
                                        endContent={
                                            <Button
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    setIsPasswordVisible((prevState) => !prevState);
                                                }}
                                                variant="ghost"
                                                className="p-0 min-w-0 min-h-0 border-none translate-y-1"
                                            >
                                                <RiEyeLine size={16} color="white" />
                                            </Button>
                                        }
                                        isDisabled={isLoading}
                                        onChange={(event) =>
                                            setNewUserObj({
                                                ...newUserObj,
                                                password: event.target.value,
                                            })
                                        }
                                        value={newUserObj.password}
                                        required
                                        type={isPasswordVisible ? 'text' : 'password'}
                                        label="Придумайте пароль"
                                    />

                                    {userAuthError && (
                                        <p className="text-left w-full italic text-red-500">
                                            {renderAuthErrorText}
                                        </p>
                                    )}

                                    <Button
                                        isLoading={isLoading}
                                        isDisabled={!isFormValidated}
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
