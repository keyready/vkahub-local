import { Button, Input, Modal, ModalContent } from '@nextui-org/react';
import { FormEvent, useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { sendRecoveryLink } from '../../model/services/authServices/sendRecoveryLink';
import { getUserIsLoading } from '../../model/selectors/UserSelectors';

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

    const [mail, setMail] = useState<string>('');
    const [isMailSent, setIsMailSent] = useState<boolean>(false);

    const handleFormSubmit = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const result = await toastDispatch(dispatch(sendRecoveryLink(mail)), {
                loading: 'Ждем почту...',
                success: 'Проверьте почтовый ящик',
                error: 'Произошла ошибка',
            });

            if (result.meta.requestStatus === 'fulfilled') {
                setIsMailSent(true);
            }
        },
        [dispatch, mail],
    );

    const isButtonDisabled = useMemo(() => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return !mail || !emailRegex.test(mail) || isUserLoading;
    }, [isUserLoading, mail]);

    const renderFormContent = useMemo(() => {
        if (isMailSent) {
            return (
                <VStack gap="24px" maxW>
                    <h1 className="w-full text-center text-primary">
                        Письмо отправили. Следуйте указанным в нем инструкциям, чтобы изменить
                        пароль
                    </h1>
                </VStack>
            );
        }

        return (
            <VStack gap="24px" maxW>
                <h1 className="w-full text-center text-primary">
                    Если Вы забыли пароль, мы отправим Вам письмо на почту, указанную при
                    регистрации, для прохождения процедуры восстановления доступа
                </h1>
                <Input
                    isDisabled={isUserLoading}
                    value={mail}
                    onChange={(event) => setMail(event.target.value)}
                    isRequired
                    autoFocus
                    size="sm"
                    label="Ваша почта"
                    type="email"
                />
                <Button
                    isLoading={isUserLoading}
                    isDisabled={isButtonDisabled}
                    className="self-end"
                    type="submit"
                >
                    {isUserLoading ? 'Ожидайте...' : 'Запросить сброс пароля'}
                </Button>
            </VStack>
        );
    }, [isButtonDisabled, isMailSent, isUserLoading, mail]);

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
                    <form onSubmit={handleFormSubmit}>{renderFormContent}</form>
                </VStack>
            </ModalContent>
        </Modal>
    );
};
