import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@nextui-org/react';

import { Notification, NotificationStatus } from '../../model/types/Notification';
import { readNotification } from '../../model/service/Notification';
import { getIsNotificationLoading } from '../../model/selectors/NotificationSelectors';

import { classNames } from '@/shared/lib/classNames';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { toastDispatch } from '@/widgets/Toaster';

interface NotificationCardProps {
    className?: string;
    notification: Notification;
}

export const NotificationCard = (props: NotificationCardProps) => {
    const { className, notification } = props;

    const dispatch = useAppDispatch();

    const isNotificationLoading = useSelector(getIsNotificationLoading);

    const renderSendTime = useMemo(
        () =>
            new Date(notification.createdAt).toLocaleDateString('ru-RU', {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            }),
        [notification.createdAt],
    );

    const handleReadNotification = useCallback(async () => {
        await toastDispatch(dispatch(readNotification(notification.id)), {
            loading: 'Читаем уведомление...',
            success: 'Уведомление скрыто!',
            error: 'Опять что-то сломалось...',
        });
    }, [dispatch, notification.id]);

    return (
        <div
            className={classNames(
                'overflow-x-hidden grid grid-cols-5 gap-4 items-start justify-items-center',
                {},
                [className],
            )}
        >
            <p className="col-span-1 italic">{renderSendTime}</p>
            <h1
                className={`text-start w-full ${
                    notification.status === NotificationStatus.NEW ? 'col-span-3' : 'col-span-4'
                }`}
            >
                {notification.message}
            </h1>
            {notification.status === NotificationStatus.NEW && (
                <Button
                    size="sm"
                    isLoading={isNotificationLoading}
                    isDisabled={isNotificationLoading}
                    color="success"
                    className="bg-opacity-70"
                    onClick={handleReadNotification}
                >
                    {isNotificationLoading ? 'Отмечаем...' : 'Прочитать'}
                </Button>
            )}
        </div>
    );
};
