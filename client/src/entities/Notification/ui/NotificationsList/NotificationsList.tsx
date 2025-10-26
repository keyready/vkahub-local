import { Divider, Tab, Tabs } from '@nextui-org/react';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import { Notification } from '../../model/types/Notification';
import { NotificationCard } from '../NotificationCard/NotificationCard';

import { classNames } from '@/shared/lib/classNames';
import { VStack } from '@/shared/ui/Stack';
import { getUserData } from '@/entities/User';
import { useSockets } from '@/shared/api/useSockets';

interface NotificationsListProps {
    className?: string;
}

export const NotificationsList = (props: NotificationsListProps) => {
    const { className } = props;

    const userData = useSelector(getUserData);

    const [newNotifications, setNewNotifications] = useState<Notification[]>([]);
    const [readNotifications, setReadNotifications] = useState<Notification[]>([]);

    const { data: newNotificationString } = useSockets<string, void>(
        `/notifications?userId=${userData?.id}&type=new`,
    );
    const { data: readNotificationString } = useSockets<string, void>(
        `/notifications?userId=${userData?.id}&type=read`,
    );

    useEffect(() => {
        if (newNotificationString) {
            setNewNotifications(JSON.parse(newNotificationString));
        }
    }, [newNotificationString]);

    useEffect(() => {
        if (readNotificationString) {
            setReadNotifications(JSON.parse(readNotificationString));
        }
    }, [readNotificationString]);

    return (
        <VStack
            gap="12px"
            maxW
            className={classNames('overflow-auto max-h-[460px]', {}, [className])}
        >
            <Tabs
                variant="underlined"
                classNames={{
                    base: 'w-full mb-5',
                    tabList: 'w-full',
                }}
            >
                <Tab title="Новые" key="new" className="w-full">
                    {newNotifications?.length ? (
                        [...newNotifications]
                            .sort(
                                (a, b) =>
                                    new Date(b.createdAt).getTime() -
                                    new Date(a.createdAt).getTime(),
                            )
                            .map((notification: Notification, index: number) => (
                                <VStack maxW gap="8px">
                                    <NotificationCard
                                        key={notification.id}
                                        notification={notification}
                                    />
                                    {index < newNotifications.length - 1 && (
                                        <Divider className="mb-2 bg-accent opacity-30" />
                                    )}
                                </VStack>
                            ))
                    ) : (
                        <h1 className="text-center italic w-full">Пока ничего нового ;(</h1>
                    )}
                </Tab>
                <Tab title="Архив" key="read" className="w-full">
                    {readNotifications?.length ? (
                        [...readNotifications]
                            .sort(
                                (a, b) =>
                                    new Date(b.createdAt).getTime() -
                                    new Date(a.createdAt).getTime(),
                            )
                            .map((notification: Notification, index: number) => (
                                <VStack maxW gap="8px">
                                    <NotificationCard
                                        key={notification.id}
                                        notification={notification}
                                    />
                                    {index < readNotifications.length - 1 && (
                                        <Divider className="mb-2 bg-accent opacity-30" />
                                    )}
                                </VStack>
                            ))
                    ) : (
                        <h1 className="text-center italic w-full">Пока ничего нового ;(</h1>
                    )}
                </Tab>
            </Tabs>
        </VStack>
    );
};
