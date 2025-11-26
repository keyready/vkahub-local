import { Button, Input, Modal, ModalContent } from '@nextui-org/react';
import { FormEvent, useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';

import { sendRecoveryLink } from '../../model/services/authServices/sendRecoveryLink';
import { getUserIsLoading } from '../../model/selectors/UserSelectors';
import { approveRecoveryAnswer } from '../../model/services/authServices/approveRecoveryAnswer';
import { changePassword } from '../../model/services/authServices/changePassword';

import { classNames } from '@/shared/lib/classNames';
import { VStack } from '@/shared/ui/Stack';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { toastDispatch } from '@/widgets/Toaster';

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

    const [password, setPassword] = useState<string>('');
    const [repPassword, setRepPassword] = useState<string>('');

    const handleFormSubmit = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (!recoveryAnswer && !recoveryQuestion) {
                const result = await toastDispatch(dispatch(sendRecoveryLink(username)), {
                    error: 'Пользователь с таким username не найден',
                    success: 'Теперь введите ответ на вопрос',
                });

                if (sendRecoveryLink.fulfilled.match(result)) {
                    setRecoveryQuestion(result.payload.question);
                }
                return;
            }
            if (recoveryAnswer && recoveryQuestion) {
                const result = await toastDispatch(
                    dispatch(approveRecoveryAnswer({ username, answer: recoveryAnswer })),
                    {
                        error: 'Не удалось подтвердить подлинность ответа',
                        success: 'А теперь придумайте новый пароль',
                    },
                );

                if (approveRecoveryAnswer.fulfilled.match(result)) {
                    setChangePasswordStage(true);
                    setRecoveryQuestion('');
                    return;
                }
            }

            await toastDispatch(
                dispatch(
                    changePassword({
                        new_password: password,
                        username,
                    }),
                ),
                {
                    success: 'Пароль изменен, пробуйте авторизоваться',
                },
            );
            setIsOpened(false);
            setUsername('');
            setRecoveryQuestion('');
            setRecoveryAnswer('');
            setChangePasswordStage(false);
            setPassword('');
            setRepPassword('');
        },
        [dispatch, password, recoveryAnswer, recoveryQuestion, setIsOpened, username],
    );

    const isButtonDisabled = useMemo(() => {
        if (recoveryQuestion) return !username || isUserLoading || !recoveryAnswer;
        return !username || isUserLoading;
    }, [isUserLoading, recoveryAnswer, recoveryQuestion, username]);

    const renderChangePasswordForm = useMemo(
        () => (
            <div className="flex flex-col gap-4 w-full">
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
                    <Input
                        isDisabled={isUserLoading}
                        value={password}
                        onValueChange={setPassword}
                        isRequired
                        autoFocus
                        size="sm"
                        label="Введите пароль"
                        type="password"
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
                    <Input
                        isDisabled={isUserLoading}
                        value={repPassword}
                        onValueChange={setRepPassword}
                        isRequired
                        size="sm"
                        label="Повторите пароль"
                        type="password"
                    />
                </motion.div>

                <Button
                    isLoading={isUserLoading}
                    isDisabled={password !== repPassword}
                    className="self-end"
                    type="submit"
                    color="primary"
                >
                    {isUserLoading ? 'Ожидайте...' : 'Сменить пароль'}
                </Button>
            </div>
        ),
        [isUserLoading, password, repPassword],
    );

    const renderGetRecoveryQuestionForm = useMemo(
        () => (
            <VStack gap="12px" maxW>
                <h1 className="w-full text-xl italic text-center text-primary">
                    Если Вы забыли пароль, введите имя пользователя, под которым Вы регистрировались
                </h1>
                <Input
                    startContent={<p className="translate-y-0.5 dark:text-white">@</p>}
                    isDisabled={isUserLoading}
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
                    <form onSubmit={handleFormSubmit}>
                        <AnimatePresence mode="wait">
                            {changePasswordStage
                                ? renderChangePasswordForm
                                : renderGetRecoveryQuestionForm}
                        </AnimatePresence>
                    </form>
                </VStack>
            </ModalContent>
        </Modal>
    );
};
