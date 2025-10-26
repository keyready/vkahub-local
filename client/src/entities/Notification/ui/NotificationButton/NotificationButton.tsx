import { RiNotification4Line } from '@remixicon/react';
import { Badge, Button, cn } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { NotificationsList } from '../NotificationsList/NotificationsList';
import { NotificationReducer } from '../../model/slice/NotificationSlice';

import classes from './NotificationButton.module.scss';

import { classNames, Mods } from '@/shared/lib/classNames';
import { VStack } from '@/shared/ui/Stack';
import { DynamicModuleLoader } from '@/shared/lib/DynamicModuleLoader';
import { getUserData } from '@/entities/User';
import { useSockets } from '@/shared/api/useSockets';
import { Notification } from '@/entities/Notification';

interface NotificationButtonProps {
    className?: string;
}

export const NotificationButton = (props: NotificationButtonProps) => {
    const { className } = props;

    const userData = useSelector(getUserData);
    const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);

    const { data: notificationString } = useSockets<string>(
        `/notifications?userId=${userData?.id}&type=new`,
    );
    const [isMenuOpened, setIsMenuOpened] = useState<boolean>(false);

    useEffect(() => {
        if (notificationString) {
            setLocalNotifications(JSON.parse(notificationString));
        }
    }, [notificationString]);

    const panelMods: Mods = {
        [classes.active]: isMenuOpened,
    };
    const overlayMods: Mods = {
        [classes.activeOverlay]: isMenuOpened,
    };

    return (
        <DynamicModuleLoader reducers={{ notification: NotificationReducer }}>
            <VStack className={classNames('self-stretch relative', {}, [className])}>
                <Badge
                    className={
                        !localNotifications?.length ? 'hidden' : 'border-none flex-grow z-50'
                    }
                    content={localNotifications?.length}
                    color="success"
                >
                    <Button
                        radius="full"
                        variant="ghost"
                        className={cn(
                            'bg-accent text-white h-12 flex-grow w-fit min-w-fit z-50 border-none',
                            'hover:bg-white hover:text-accent',
                            'dark:bg-inverted dark:hover:bg-accent dark:text-accent dark:hover:text-white',
                        )}
                        onClick={() => setIsMenuOpened(!isMenuOpened)}
                    >
                        <RiNotification4Line />
                    </Button>
                </Badge>

                <div
                    onClick={() => setIsMenuOpened(false)}
                    className={classNames(classes.overlay, overlayMods)}
                >
                    <div className={classes.overlayBody}>
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className={classNames(classes.panel, panelMods, [
                                'bg-opacity-10 bg-black',
                            ])}
                        >
                            <NotificationsList />
                        </div>
                    </div>
                </div>
            </VStack>
        </DynamicModuleLoader>
    );
};
