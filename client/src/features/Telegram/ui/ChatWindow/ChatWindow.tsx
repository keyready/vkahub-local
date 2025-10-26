import { useSelector } from 'react-redux';
import { useCallback, useEffect, useState } from 'react';
import {
    Button,
    Image,
    Modal,
    ModalContent,
    ModalHeader,
    Radio,
    RadioGroup,
    Textarea,
} from '@nextui-org/react';
import { RiAttachmentLine, RiSendPlaneLine, RiSettings3Line } from '@remixicon/react';

import { MessagesList } from '../MessagesList/MessagesList';
import { TelegramReducer } from '../../model/slice/TelegramSlice';
import { MessageInputField } from '../MessageInputField/MessageInputField';

import classes from './ChatWindow.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { getUserIsLoading } from '@/entities/User';
import { HStack, VStack } from '@/shared/ui/Stack';
import { Skeleton } from '@/shared/ui/Skeleton';
import { getTeamData } from '@/entities/Team';
import { DynamicModuleLoader } from '@/shared/lib/DynamicModuleLoader';

interface ChatSettings {
    sendMessage: 'ctrl' | 'enter';
    receiveMessage: 'flow' | 'leave';
}

interface ChatWindowProps {
    className?: string;
}

export const ChatWindow = (props: ChatWindowProps) => {
    const { className } = props;

    const teamData = useSelector(getTeamData);
    const isProfileLoading = useSelector(getUserIsLoading);

    const [isSettingsOpened, setIsSettingsOpened] = useState<boolean>(false);
    const [chatSettings, setChatSettings] = useState<ChatSettings>({
        sendMessage: 'ctrl',
        receiveMessage: 'flow',
    });

    useEffect(() => {
        const localChatSettings = localStorage.getItem('chatSettings');
        if (localChatSettings) {
            setChatSettings(JSON.parse(localChatSettings));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('chatSettings', JSON.stringify(chatSettings));
    }, [chatSettings]);

    const normalize_count_form = useCallback((number: number, words_arr: string[]) => {
        number = Math.abs(number);
        if (Number.isInteger(number)) {
            const options = [2, 0, 1, 1, 1, 2];
            return words_arr[
                number % 100 > 4 && number % 100 < 20
                    ? 2
                    : options[number % 10 < 5 ? number % 10 : 5]
            ];
        }
        return words_arr[1];
    }, []);

    if (isProfileLoading) {
        return (
            <VStack
                justify="between"
                maxW
                flexGrow
                className={classNames(classes.ChatWindow, {}, [className])}
            >
                <HStack maxW justify="between" className={classes.chatHeader}>
                    <VStack maxW gap="4px">
                        <Skeleton width={200} height={20} />
                        <Skeleton width={125} height={15} />
                    </VStack>

                    <Skeleton width={60} height={60} rounded={9999} />
                </HStack>

                <div className="p-4 flex gap-4 flex-col h-[382px] w-full overflow-y-auto">
                    {new Array(5).fill(0).map((_, index) => (
                        <HStack align="end" gap="12px" maxW className={classes.skeleton}>
                            <Skeleton width={40} height={40} rounded={9999} />
                            <Skeleton
                                width={Math.floor(Math.random() * 201) + 200}
                                height={Math.floor(Math.random() * 25) + 60}
                                key={index}
                            />
                        </HStack>
                    ))}
                </div>

                <div className="relative w-full">
                    <Textarea
                        isDisabled
                        minRows={4}
                        classNames={{
                            inputWrapper:
                                'h-auto data-[hover=true]:bg-input-bg data-[hover=true]:bg-opacity-70',
                            input: 'pr-24',
                        }}
                        placeholder="Напишите сообщение..."
                    />
                    <HStack className="absolute bottom-[50%] translate-y-1/2 right-2">
                        <Button
                            isDisabled
                            htmlFor="attachFile"
                            as="label"
                            className="p-0 w-11 h-11 min-w-fit rounded-md text-primary"
                        >
                            <RiAttachmentLine />
                        </Button>
                        <input
                            id="attachFile"
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                                console.log(e.target.files);
                            }}
                        />
                        <Button
                            isDisabled
                            className="p-0 w-11 h-11 min-w-fit rounded-md bg-accent text-primary"
                        >
                            <RiSendPlaneLine />
                        </Button>
                    </HStack>
                </div>
            </VStack>
        );
    }

    return (
        <DynamicModuleLoader reducers={{ message: TelegramReducer }}>
            <VStack
                justify="between"
                maxW
                flexGrow
                className={classNames(classes.ChatWindow, {}, [className])}
            >
                <HStack maxW justify="between" className={classes.chatHeader}>
                    <VStack maxW gap="0">
                        <h1 className="text-l font-bold">{teamData?.title}</h1>
                        <p className="text-m opacity-60 italic">
                            {teamData?.members.length || 0}{' '}
                            {normalize_count_form(teamData?.members.length || 0, [
                                'участник',
                                'участника',
                                'участников',
                            ])}
                        </p>
                    </VStack>

                    <Image
                        width={60}
                        height={60}
                        className="rounded-full"
                        classNames={{ wrapper: classes.avatarFallback }}
                        fallbackSrc="/static/fallbacks/team-fallback.webp"
                        src={`${import.meta.env.VITE_MINIO_ENDPOINT}/teams_bucket/${teamData?.image}`}
                        alt={teamData?.title}
                    />
                    <Button
                        onClick={() => setIsSettingsOpened(true)}
                        variant="ghost"
                        className="absolute top-1/2 -translate-y-1/2 -right-11 min-w-fit w-fit"
                    >
                        <RiSettings3Line />
                    </Button>
                </HStack>

                <MessagesList
                    receiveMessage={chatSettings.receiveMessage}
                    teamId={teamData?.id || -1}
                />
                <MessageInputField sendVariant={chatSettings.sendMessage} />

                <Modal
                    hideCloseButton
                    isOpen={isSettingsOpened}
                    onClose={() => setIsSettingsOpened(false)}
                    backdrop="blur"
                >
                    <ModalContent className="p-8 bg-grad-end dark:bg-card-bg">
                        <ModalHeader className="p-0 mb-4">
                            <h1 className="text-primary font-bold text-l">Настройки</h1>
                        </ModalHeader>
                        <VStack gap="8px" maxW>
                            <RadioGroup
                                value={chatSettings.sendMessage}
                                onValueChange={(value) =>
                                    setChatSettings({
                                        ...chatSettings,
                                        sendMessage: value as 'ctrl' | 'enter',
                                    })
                                }
                                label="Отправка сообщений"
                            >
                                <Radio value="ctrl">Ctrl + Enter</Radio>
                                <Radio value="enter">Enter</Radio>
                            </RadioGroup>
                            <RadioGroup
                                value={chatSettings.receiveMessage}
                                onValueChange={(value) =>
                                    setChatSettings({
                                        ...chatSettings,
                                        receiveMessage: value as 'flow' | 'leave',
                                    })
                                }
                                label="При получении сообщения"
                            >
                                <Radio value="flow">Пролистывать</Radio>
                                <Radio value="leave">Оставлять как есть</Radio>
                            </RadioGroup>
                        </VStack>
                    </ModalContent>
                </Modal>
            </VStack>
        </DynamicModuleLoader>
    );
};
