import { Button, Input, Modal, ModalContent } from '@nextui-org/react';
import { FormEvent, useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { sendRecoveryLink } from '../../model/services/authServices/sendRecoveryLink';
import { getUserIsLoading } from '../../model/selectors/UserSelectors';
import { approveRecoveryAnswer } from '../../model/services/authServices/approveRecoveryAnswer';
import { changePasswordSchema } from '../../model/types/validationSchemas';

import { classNames } from '@/shared/lib/classNames';
import { VStack } from '@/shared/ui/Stack';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { toastDispatch } from '@/widgets/Toaster';
import { changePassword } from '@/entities/User';

interface RecoveryPasswordModalProps {
    className?: string;
    isOpened: boolean;
    setIsOpened: (state: boolean) => void;
}

export const RecoveryPasswordModal = (props: RecoveryPasswordModalProps) => {
    const { className, setIsOpened, isOpened } = props;

    const handleCloseForm = useCallback(() => {
        setIsOpened(false);
    }, [setIsOpened]);

    const dispatch = useAppDispatch();
    const isUserLoading = useSelector(getUserIsLoading);

    const [username, setUsername] = useState<string>('');
    const [recoveryQuestion, setRecoveryQuestion] = useState<string>('');
    const [recoveryAnswer, setRecoveryAnswer] = useState<string>('');
    const [changePasswordStage, setChangePasswordStage] = useState<boolean>(false);

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<{ newPassword: string; confirmNewPassword: string }>({
        resolver: yupResolver(changePasswordSchema),
        mode: 'onChange',
    });

    const handleFormSubmit = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (!recoveryAnswer && !recoveryQuestion) {
                const result = await toastDispatch(dispatch(sendRecoveryLink(username)), {
                    error: {
                        404: 'Пользователь с таким username не найден',
                        406: 'Не указан способ восстановления пароля',
                    },
                    success: 'Теперь введите ответ на вопрос',
                });

                if (sendRecoveryLink.fulfilled.match(result) && result.payload.question) {
                    setRecoveryQuestion(result.payload.question);
                }
                return;
            }
            if (recoveryAnswer && recoveryQuestion) {
                const result = await toastDispatch(
                    dispatch(approveRecoveryAnswer({ username, answer: recoveryAnswer })),
                    {
                        error: 'Введен неверный ответ',
                        success: 'А теперь придумайте новый пароль',
                    },
                );

                if (approveRecoveryAnswer.fulfilled.match(result)) {
                    setChangePasswordStage(true);
                    setRecoveryQuestion('');
                }
            }
        },
        [dispatch, recoveryAnswer, recoveryQuestion, username],
    );

    const handleChangePassword = useCallback(
        async (passwords: { newPassword: string; confirmNewPassword: string }) => {
            const result = await toastDispatch(
                dispatch(
                    changePassword({
                        new_password: passwords.newPassword,
                        username,
                    }),
                ),
                {
                    success: 'Пароль изменен, пробуйте авторизоваться',
                },
            );

            if (changePassword.fulfilled.match(result)) {
                setIsOpened(false);
                setUsername('');
                setRecoveryQuestion('');
                setRecoveryAnswer('');
                setChangePasswordStage(false);
            }
        },
        [dispatch, setIsOpened, username],
    );

    const isButtonDisabled = useMemo(() => {
        if (recoveryQuestion) return !username || isUserLoading || !recoveryAnswer;
        return !username || isUserLoading;
    }, [isUserLoading, recoveryAnswer, recoveryQuestion, username]);

    const renderChangePasswordForm = useMemo(
        () => (
            <form
                onSubmit={handleSubmit(handleChangePassword)}
                className="flex flex-col gap-4 w-full"
            >
                <h1 className="text-primary text-xl italic">
                    <b>Пожалуйста</b>, запомните пароль, который введете!
                </h1>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    exit={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="w-full"
                    key="password"
                >
                    <Controller
                        render={({ field }) => (
                            <Input
                                isDisabled={isUserLoading}
                                isRequired
                                size="sm"
                                label="Придумайте пароль"
                                type="password"
                                value={field.value}
                                onValueChange={field.onChange}
                                isInvalid={Boolean(errors.newPassword?.message)}
                                errorMessage={errors.newPassword?.message}
                                classNames={{
                                    errorMessage: 'text-start text-red-400 font-bold',
                                }}
                            />
                        )}
                        control={control}
                        name="newPassword"
                    />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    exit={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full"
                    key="repeatedPassword"
                >
                    <Controller
                        render={({ field }) => (
                            <Input
                                isDisabled={isUserLoading}
                                isRequired
                                size="sm"
                                label="Повторите пароль"
                                type="password"
                                value={field.value}
                                onValueChange={field.onChange}
                                isInvalid={Boolean(errors.confirmNewPassword?.message)}
                                errorMessage={errors.confirmNewPassword?.message}
                                classNames={{
                                    errorMessage: 'text-start text-red-400 font-bold',
                                }}
                            />
                        )}
                        control={control}
                        name="confirmNewPassword"
                    />
                </motion.div>

                <Button
                    isLoading={isUserLoading}
                    isDisabled={!isValid}
                    className="self-end"
                    type="submit"
                    color="primary"
                >
                    {isUserLoading ? 'Ожидайте...' : 'Сменить пароль'}
                </Button>
            </form>
        ),
        [
            control,
            errors.confirmNewPassword?.message,
            errors.newPassword?.message,
            handleChangePassword,
            handleSubmit,
            isUserLoading,
            isValid,
        ],
    );

    const renderGetRecoveryQuestionForm = useMemo(
        () => (
            <VStack gap="12px" maxW>
                <h1 className="w-full text-xl italic text-center text-primary">
                    Если Вы забыли пароль, введите имя пользователя, под которым Вы регистрировались
                </h1>
                <Input
                    startContent={<p className="translate-y-0.5 dark:text-white">@</p>}
                    isDisabled={isUserLoading || Boolean(recoveryQuestion)}
                    value={username}
                    onValueChange={setUsername}
                    isRequired
                    autoFocus
                    size="sm"
                    label="Ваше имя пользователя"
                />
                {recoveryQuestion && (
                    <>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            exit={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="w-full"
                            key="recoveryQuestion"
                        >
                            <Input
                                isReadOnly
                                value={recoveryQuestion}
                                size="sm"
                                label="Вопрос, указанный при регистрации"
                            />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            exit={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="w-full"
                            key="recoveryAnswer"
                        >
                            <Input
                                isDisabled={isUserLoading}
                                value={recoveryAnswer}
                                onValueChange={setRecoveryAnswer}
                                autoFocus
                                isRequired
                                size="sm"
                                label="Введите ответ на вопрос выше"
                            />
                        </motion.div>
                    </>
                )}
                <Button
                    isLoading={isUserLoading}
                    isDisabled={isButtonDisabled}
                    className="self-end"
                    type="submit"
                    color="primary"
                >
                    {isUserLoading ? 'Ожидайте...' : 'Запросить сброс пароля'}
                </Button>
            </VStack>
        ),
        [isButtonDisabled, isUserLoading, recoveryAnswer, recoveryQuestion, username],
    );

    return (
        <Modal
            size="3xl"
            backdrop="blur"
            isDismissable={!isUserLoading}
            hideCloseButton={isUserLoading}
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
                    <AnimatePresence mode="wait">
                        {changePasswordStage ? (
                            renderChangePasswordForm
                        ) : (
                            <form onSubmit={handleFormSubmit}>{renderGetRecoveryQuestionForm}</form>
                        )}
                    </AnimatePresence>
                </VStack>
            </ModalContent>
        </Modal>
    );
};
