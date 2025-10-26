import {
    RiCalendarEventLine,
    RiContractLine,
    RiGroupLine,
    RiLogoutCircleLine,
    RiMedalLine,
    RiProfileLine,
    RiQuestionLine,
    RiTeamLine,
} from '@remixicon/react';
import { Divider, Image } from '@nextui-org/react';
import { useSelector } from 'react-redux';
import { useCallback } from 'react';

import classes from './MobileSidebar.module.scss';

import { classNames, Mods } from '@/shared/lib/classNames';
import { HStack, VStack } from '@/shared/ui/Stack';
import { AppLink } from '@/shared/ui/AppLink';
import { RoutePath } from '@/shared/config/routeConfig';
import { getUserData, logoutService, UserActions } from '@/entities/User';
import { TextButton } from '@/shared/ui/TextButton';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { toastDispatch } from '@/widgets/Toaster';

interface MobileSidebarProps {
    className?: string;
    isOpened: boolean;
    onClose: () => void;
}

export const MobileSidebar = (props: MobileSidebarProps) => {
    const { className, onClose, isOpened } = props;

    const userData = useSelector(getUserData);

    const dispatch = useAppDispatch();

    const handleLogoutClick = useCallback(async () => {
        await toastDispatch(dispatch(logoutService()), {
            error: 'На стороне сервера произошла ошибка. Авторизуйтесь и повторите попытку',
            loading: 'Стираем данные...',
            success: 'До скорой встречи!',
        });
        dispatch(UserActions.logout());
    }, [dispatch]);

    const mods: Mods = {
        [classes.MobileSidebarOpen]: isOpened,
    };

    return (
        <button
            aria-label="Закрыть сайдбар"
            type="button"
            onClick={onClose}
            className={classNames(classes.backdrop, { [classes.backdropActive]: isOpened })}
        >
            <VStack align="center" className={classNames(classes.MobileSidebar, mods, [className])}>
                <HStack maxW justify="center">
                    <Image
                        classNames={{
                            wrapper: classes.avatarImage,
                        }}
                        width={80}
                        height={80}
                        fallbackSrc="/static/fallbacks/user-fallback.webp"
                        src={`https://storage.yandexcloud.net/vkahub-storage/${userData?.avatar}`}
                        className="rounded-full w-20 h-20 max-w-20"
                    />
                </HStack>

                <VStack className="p-4" flexGrow maxW justify="center">
                    <VStack gap="24px" align="center" maxW>
                        <VStack maxW gap="12px">
                            <AppLink className="text-l w-full" to={RoutePath.events}>
                                <HStack maxW gap="12px" justify="between">
                                    <p>События</p>
                                    <RiCalendarEventLine />
                                </HStack>
                            </AppLink>
                            <AppLink className="text-l w-full" to={RoutePath.teams}>
                                <HStack maxW gap="12px" justify="between">
                                    <p>Команды</p>
                                    <RiTeamLine />
                                </HStack>
                            </AppLink>
                            <AppLink className="text-l w-full" to={RoutePath.members}>
                                <HStack maxW justify="between">
                                    <p>Участники</p>
                                    <RiGroupLine />
                                </HStack>
                            </AppLink>
                        </VStack>

                        <Divider />

                        <VStack maxW gap="12px">
                            <AppLink to={RoutePath.feed} className="text-l w-full">
                                <HStack maxW justify="between" gap="12px">
                                    <p>Личный кабинет</p>
                                    <RiProfileLine className="text-accent" />
                                </HStack>
                            </AppLink>
                            <AppLink to={RoutePath.achievements} className="text-l w-full">
                                <HStack maxW justify="between" gap="12px">
                                    <p>Достижения</p>
                                    <RiMedalLine className="text-accent" />
                                </HStack>
                            </AppLink>
                            <AppLink to={RoutePath.feedback} className="text-l w-full">
                                <HStack maxW justify="between" gap="12px">
                                    <p>Обратная связь</p>
                                    <RiQuestionLine className="text-accent" />
                                </HStack>
                            </AppLink>

                            <AppLink to={RoutePath.rules} className="text-l w-full">
                                <HStack maxW justify="between" gap="12px">
                                    <p>Правила</p>
                                    <RiContractLine className="text-accent" />
                                </HStack>
                            </AppLink>
                        </VStack>

                        <Divider />

                        <HStack maxW justify="between" gap="12px">
                            <TextButton
                                className="text-l no-underline w-full text-left text-red-400"
                                onClick={handleLogoutClick}
                            >
                                Выйти
                            </TextButton>
                            <RiLogoutCircleLine className="text-red-400" />
                        </HStack>
                    </VStack>
                </VStack>
            </VStack>
        </button>
    );
};
