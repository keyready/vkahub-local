import { Image } from '@nextui-org/react';
import { useEffect, useRef } from 'react';

import { Message as MessageType } from '../../model/types/Message';
import classes from '../ChatWindow/ChatWindow.module.scss';
import { Message } from '../Message/Message';

import { classNames } from '@/shared/lib/classNames';
import { VStack } from '@/shared/ui/Stack';
import { useSockets } from '@/shared/api/useSockets';

interface MessagesListProps {
    className?: string;
    teamId: number;
    receiveMessage?: 'flow' | 'leave';
}

export const MessagesList = (props: MessagesListProps) => {
    const { className, teamId, receiveMessage } = props;

    const { data: messages } = useSockets<MessageType[], void>(`/messenger/${teamId}`);

    const triggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (triggerRef.current && receiveMessage === 'flow') {
            triggerRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, receiveMessage]);

    if (!messages?.length) {
        return (
            <VStack
                maxW
                align="center"
                justify="center"
                className={classNames(
                    'p-4 flex gap-4 flex-col h-[382px] w-full overflow-y-auto',
                    {},
                    [className],
                )}
            >
                <VStack maxW align="center">
                    <Image
                        width={256}
                        height={256}
                        classNames={{ wrapper: classes.helloMessage }}
                        fallbackSrc="/static/hello-message-pict.webp"
                        src="/static/hello-message-pict.webp"
                    />
                    <h3 className="text-l italic">Отправьте первое сообщение!</h3>
                </VStack>
            </VStack>
        );
    }

    return (
        <VStack
            maxW
            className={classNames('p-4 flex gap-4 flex-col h-[382px] w-full overflow-y-auto', {}, [
                className,
            ])}
        >
            {/* @ts-ignore */}
            {JSON.parse(messages).map((message, index) => (
                <Message key={index} message={message} />
            ))}
            <div ref={triggerRef} />
        </VStack>
    );
};
