import { Button, Image, Textarea } from '@nextui-org/react';
import {
    RiAttachmentLine,
    RiCloseCircleLine,
    RiFile3Line,
    RiSendPlaneLine,
} from '@remixicon/react';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

import { sendMessage } from '../../model/service/sendMessage';
import { getMessageIsLoading } from '../../model/selectors/Telegram';

import classes from './MessageInputField.module.scss';

import { HStack, VStack } from '@/shared/ui/Stack';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { encrypt } from '@/shared/lib/hooks/useCrypto/useCrypto';

export const MessageInputField = ({ sendVariant }: { sendVariant: 'ctrl' | 'enter' }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [message, setMessage] = useState<string>('');

    const dispatch = useAppDispatch();
    const isMessageLoading = useSelector(getMessageIsLoading);

    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const handleRemoveAttachedFile = useCallback((file: File) => {
        setFiles((prev) => prev.filter((f) => f.name !== file.name));
    }, []);

    const renderAttachedFilePreview = useCallback(
        (file: File) => {
            if (file.type.startsWith('image/')) {
                return (
                    <div className="relative">
                        <Image
                            width={40}
                            height={40}
                            classNames={{
                                wrapper: classes.attachedFilePreview,
                            }}
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="rounded-md"
                        />
                        <button
                            aria-label="Remove attachment"
                            type="button"
                            onClick={() => handleRemoveAttachedFile(file)}
                            className="z-20 absolute top-0 right-0 cursor-pointer"
                        >
                            <RiCloseCircleLine size={20} color="red" />
                        </button>
                    </div>
                );
            }
            return (
                <HStack
                    justify="center"
                    align="center"
                    className="bg-input-hover-bg rounded-md p-2 relative w-10 h-10"
                >
                    <RiFile3Line key={file.name} size={28} />
                    <button
                        aria-label="Remove attachment"
                        type="button"
                        onClick={() => handleRemoveAttachedFile(file)}
                        className="z-20 absolute top-0 right-0 cursor-pointer"
                    >
                        <RiCloseCircleLine size={20} color="red" />
                    </button>
                </HStack>
            );
        },
        [handleRemoveAttachedFile],
    );

    const handleAttachFiles = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) {
            toast.error('Выберите файлы');
            return;
        }

        setFiles(Array.from(event.target.files).slice(0, 10));
    }, []);

    const handleSendMessage = useCallback(async () => {
        const formData = new FormData();
        formData.append('message', encrypt(message));

        if (files?.length) {
            files.forEach((file) => {
                formData.append('attachment', file);
            });
        }

        const result = await dispatch(sendMessage(formData));
        if (result.meta.requestStatus === 'fulfilled') {
            setFiles([]);
            setMessage('');
        } else {
            toast.error('Не удалось отправить сообщение');
        }
        if (textAreaRef.current) {
            textAreaRef.current.focus();
        }
    }, [dispatch, files, message]);

    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.focus();
        }
    }, [isMessageLoading]);

    useEffect(() => {
        const handleButtonsClick = (event: KeyboardEvent) => {
            if (sendVariant === 'ctrl' && event.key === 'Enter' && event.ctrlKey) {
                handleSendMessage();
            } else if (sendVariant === 'enter' && event.key === 'Enter' && !event.ctrlKey) {
                handleSendMessage();
            }
        };

        document.addEventListener('keydown', handleButtonsClick);

        return () => {
            document.removeEventListener('keydown', handleButtonsClick);
        };
    }, [handleSendMessage, sendVariant, setMessage]);

    return (
        <div className="relative w-full">
            <VStack maxW gap="0">
                {files?.length ? (
                    <HStack
                        maxW
                        gap="12px"
                        className="rounded-t-md overflow-y-auto bg-input-bg border-b-1 border-[#515151] p-5"
                    >
                        {files.map((file) => renderAttachedFilePreview(file))}
                    </HStack>
                ) : null}
                <Textarea
                    autoFocus
                    ref={textAreaRef}
                    isDisabled={isMessageLoading}
                    minRows={4}
                    maxRows={7}
                    maxLength={110}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    classNames={{
                        inputWrapper: `z-10 h-auto data-[hover=true]:bg-input-bg data-[hover=true]:bg-opacity-70 ${
                            files?.length ? 'rounded-t-none' : ''
                        }`,
                        input: 'pr-24',
                    }}
                    placeholder="Напишите сообщение..."
                />
            </VStack>
            <VStack className="z-20 absolute bottom-[50%] translate-y-1/2 right-2">
                <HStack>
                    <Button
                        isDisabled={isMessageLoading}
                        htmlFor="attachFile"
                        as="label"
                        className="p-0 w-11 h-11 min-w-fit rounded-md text-primary"
                    >
                        <RiAttachmentLine />
                    </Button>
                    <input
                        multiple
                        id="attachFile"
                        type="file"
                        className="hidden"
                        onChange={handleAttachFiles}
                    />
                    <Button
                        isDisabled={isMessageLoading}
                        onClick={handleSendMessage}
                        className="p-0 w-11 h-11 min-w-fit rounded-md bg-accent text-primary"
                    >
                        <RiSendPlaneLine />
                    </Button>
                </HStack>
                {message?.length > 80 && (
                    <p className="w-full text-center text-red-300 italic">
                        {message?.length} / 110
                    </p>
                )}
            </VStack>
        </div>
    );
};
