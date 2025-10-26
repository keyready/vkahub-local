import { Button, Image } from '@nextui-org/react';
import { useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { RiClipboardLine, RiDeleteBinLine, RiPencilLine } from '@remixicon/react';
import toast from 'react-hot-toast';

import { Message as MessageType } from '../../model/types/Message';
import { deleteMessage } from '../../model/service/deleteMessage';

import classes from './Message.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { HStack, VStack } from '@/shared/ui/Stack';
import { getUserData } from '@/entities/User';
import { ContextMenu } from '@/shared/ui/ContextMenu';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { toastDispatch } from '@/widgets/Toaster';
import { AttachmentPreview } from '@/features/Telegram/ui/AttachmentPreview/AttachmentPreview';
import { decrypt } from '@/shared/lib/hooks/useCrypto/useCrypto';

interface MessageProps {
    className?: string;
    message: MessageType;
}

export const Message = (props: MessageProps) => {
    const { className, message } = props;

    const userData = useSelector(getUserData);

    const dispatch = useAppDispatch();

    const isOwnMessage = useMemo(
        () => userData?.username === message.author.username,
        [message.author.username, userData?.username],
    );

    const handleCopyMessageClick = useCallback(async (message: string) => {
        await toast.promise(navigator.clipboard.writeText(message), {
            loading: 'Копируется...',
            success: 'Сообщение скопировано в буфер обмена',
            error: 'Ошибка при копировании сообщения',
        });
    }, []);

    const handleDeleteMessageClick = useCallback(async () => {
        await toastDispatch(dispatch(deleteMessage(message.id)), {
            loading: 'Сообщение удаляется...',
            success: 'Сообщение удалено',
            error: 'Ошибка при удалении сообщения',
        });
    }, [dispatch, message.id]);

    const handleRequestMessageDelete = useCallback(() => {
        toast(
            (t) => (
                <VStack maxW gap="24px">
                    <p className="text-center w-full italic text-red-200">
                        Вы действительно хотите удалить это сообщение?
                    </p>
                    <HStack gap="12px" maxW justify="end">
                        <Button
                            onClick={() => {
                                toast.dismiss(t.id);
                                handleDeleteMessageClick();
                            }}
                            size="sm"
                            color="danger"
                        >
                            Удалить
                        </Button>
                        <Button size="sm" color="success" onClick={() => toast.dismiss(t.id)}>
                            Отмена
                        </Button>
                    </HStack>
                </VStack>
            ),
            {
                duration: 10000,
            },
        );
    }, [handleDeleteMessageClick]);

    const messageContent = useMemo(
        () => (
            <VStack gap="0" className={classes.Message}>
                <p className="opacity-30 italic leading-none">{message.author.username}</p>
                <VStack maxW>
                    <p>{decrypt(message.message)}</p>
                    {message?.attachments && (
                        <div className="mt-2 grid grid-cols-4 gap-4">
                            {message.attachments.map((attachment) => (
                                <AttachmentPreview key={attachment} attachment={attachment} />
                            ))}
                        </div>
                    )}
                </VStack>
                <p className="opacity-30 italic text-right w-full leading-none">
                    {new Date(message.createdAt).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </p>
            </VStack>
        ),
        [message.attachments, message.author.username, message.createdAt, message.message],
    );

    return (
        <HStack
            align="end"
            gap="12px"
            className={classNames(
                classes.MessageWrapper,
                { 'flex-row-reverse self-end': isOwnMessage },
                [className],
            )}
        >
            <Image
                src={`https://storage.yandexcloud.net/vkahub-storage/${message.author.avatar}`}
                fallbackSrc="/static/fallbacks/user-fallback.webp"
                width={40}
                height={40}
                classNames={{ wrapper: classes.avatarWrapper }}
            />

            <ContextMenu
                items={[
                    ...(isOwnMessage
                        ? [
                              {
                                  text: 'Редактировать',
                                  icon: <RiPencilLine size={18} />,
                                  isDisabled: true,
                              },
                          ]
                        : []),
                    {
                        text: 'Копировать',
                        icon: <RiClipboardLine size={18} />,
                        onClick: () => handleCopyMessageClick(message.message),
                    },
                    ...(isOwnMessage
                        ? [
                              {
                                  className: 'text-red-200',
                                  text: 'Удалить',
                                  icon: <RiDeleteBinLine size={18} />,
                                  // onClick: () => handleDeleteMessageClick(message.id),
                                  onClick: handleRequestMessageDelete,
                              },
                          ]
                        : []),
                ]}
                id={`message-${message.id}`}
            >
                {messageContent}
            </ContextMenu>
        </HStack>
    );
};
