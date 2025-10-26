import { Button, Textarea } from '@nextui-org/react';
import { FormEvent, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';

import { getIsFeedbackCreating } from '../../model/selectors/FeedbackSelectors';
import { createFeedback } from '../../model/services/createFeedback';

import { VStack } from '@/shared/ui/Stack';
import { classNames } from '@/shared/lib/classNames';
import { toastDispatch } from '@/widgets/Toaster';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';

interface CreateFeedbackFormProps {
    className?: string;
    bannedReason?: boolean;
}

export const CreateFeedbackForm = (props: CreateFeedbackFormProps) => {
    const { className, bannedReason } = props;

    const isFeedbackCreating = useSelector(getIsFeedbackCreating);

    const dispatch = useAppDispatch();

    const [message, setMessage] = useState<string>('');

    const handleSubmitForm = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            if (!message) return;

            await toastDispatch(dispatch(createFeedback(message)), {
                loading: 'Записываем...',
                success: 'Сообщение успешно отправлено!',
                error: 'Что-то сломалось (',
            });
        },
        [dispatch, message],
    );

    return (
        <VStack gap="20px" maxW className={classNames('bg-card-bg', {}, [className])}>
            <VStack maxW gap="0">
                <h1 className="text-l text-primary">
                    {bannedReason
                        ? 'Узнать причину блокировки'
                        : 'Отзывы, пожелания и предложения о работе сервиса'}
                </h1>
                <p className="opacity-50 italic text-primary">
                    {bannedReason
                        ? 'Если Вы хотите узнать причины блокировки и способы, как это исправить, опишите здесь свою проблему. Мы уведомим Вас о своем решении по почте'
                        : 'Если у Вас есть идеи, как сделать проект лучше, или Вы хотите стать одним из разработчиков проекта — пишите нам, мы обязательно рассмотрим Ваше предложение.'}
                </p>
            </VStack>

            <form onSubmit={handleSubmitForm}>
                <VStack maxW gap="12px">
                    <Textarea
                        isDisabled={isFeedbackCreating}
                        minRows={4}
                        classNames={{
                            inputWrapper: 'h-auto',
                        }}
                        isRequired
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        label={
                            bannedReason
                                ? 'Что Вы хотите обжаловать?'
                                : 'Ваше послание разработчикам'
                        }
                    />

                    <Button
                        type="submit"
                        isLoading={isFeedbackCreating}
                        isDisabled={isFeedbackCreating || !message}
                        className="self-end"
                    >
                        {isFeedbackCreating ? 'Ожидайте...' : 'Отправить!'}
                    </Button>
                </VStack>
            </form>
        </VStack>
    );
};
