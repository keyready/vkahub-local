import { Image } from '@nextui-org/react';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { RiCloseLargeFill } from '@remixicon/react';
import { useSelector } from 'react-redux';

import classes from './Navbar.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { HStack } from '@/shared/ui/Stack';
import { AppLink } from '@/shared/ui/AppLink';
import { RoutePath } from '@/shared/config/routeConfig';
import { AvatarDropdown } from '@/widgets/AvatarDropdown';
import { NotificationButton } from '@/entities/Notification';
import { getCurrentTheme } from '@/widgets/ThemeSwitcher';
import { getUserData } from '@/entities/User';

interface NavbarProps {
    className?: string;
}

export const Navbar = (props: NavbarProps) => {
    const { className } = props;

    const isDark = useSelector(getCurrentTheme) === 'dark';
    const isAuth = Boolean(useSelector(getUserData).id);

    const navigate = useNavigate();

    const handleLogoClick = useCallback(() => {
        navigate(RoutePath.main);
    }, [navigate]);

    return (
        <HStack
            className={classNames(classes.Navbar, {}, [className])}
            align="center"
            justify="between"
            gap="64px"
        >
            <button
                className="flex items-center gap-5"
                aria-label="Home page"
                onClick={handleLogoClick}
                type="button"
            >
                <Image
                    className={classes.logo}
                    src={isDark ? '/static/logo.webp' : '/static/logo-light-blue.webp'}
                />
                <RiCloseLargeFill className="text-white" size={20} />
                <Image
                    height={70}
                    width={70}
                    className={classes.logo}
                    src={isDark ? '/static/vka-dark.webp' : '/static/vka.webp'}
                />
            </button>

            <HStack gap="24px" maxW justify="end">
                <AppLink className="text-l text-white dark:text-accent" to={RoutePath.events}>
                    События
                </AppLink>
                <AppLink className="text-l text-white dark:text-accent" to={RoutePath.teams}>
                    Команды
                </AppLink>
                <AppLink className="text-l text-white dark:text-accent" to={RoutePath.members}>
                    Участники
                </AppLink>
            </HStack>

            <HStack gap="12px" className="relative">
                {isAuth && <NotificationButton />}
                <AvatarDropdown />
            </HStack>
        </HStack>
    );
};
