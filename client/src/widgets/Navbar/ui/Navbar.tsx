import { Button, Image } from '@nextui-org/react';
import { useNavigate } from 'react-router-dom';
import { useCallback, useState } from 'react';
import { RiCloseLargeFill, RiMenu2Line } from '@remixicon/react';
import { useSelector } from 'react-redux';

import classes from './Navbar.module.scss';

import { classNames, Mods } from '@/shared/lib/classNames';
import { HStack } from '@/shared/ui/Stack';
import { AppLink } from '@/shared/ui/AppLink';
import { RoutePath } from '@/shared/config/routeConfig';
import { AvatarDropdown } from '@/widgets/AvatarDropdown';
import { NotificationButton } from '@/entities/Notification';
import { useWindowWidth } from '@/shared/lib/hooks/useWindowWidth';
import { MobileSidebar } from '@/widgets/MobileSidebar';
import { getCurrentTheme } from '@/widgets/ThemeSwitcher';

interface NavbarProps {
    className?: string;
}

export const Navbar = (props: NavbarProps) => {
    const { className } = props;

    const { isMobile } = useWindowWidth();
    const isDark = useSelector(getCurrentTheme) === 'dark';

    const navigate = useNavigate();

    const [isSidebarOpened, setIsSidebarOpened] = useState<boolean>(false);

    const handleLogoClick = useCallback(() => {
        navigate(RoutePath.main);
    }, [navigate]);

    const mods: Mods = {
        // [classes.ScrolledNavbar]: scrollPosition > 0,
    };

    return (
        <HStack
            className={classNames(classes.Navbar, mods, [className])}
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

            {isMobile ? null : (
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
            )}

            <HStack gap="12px" className={isMobile ? 'flex-row-reverse relative' : 'relative'}>
                {isMobile ? (
                    <Button
                        variant="faded"
                        onClick={() => setIsSidebarOpened(true)}
                        className="min-w-fit"
                    >
                        <RiMenu2Line />
                    </Button>
                ) : (
                    <HStack>
                        <NotificationButton />
                        <AvatarDropdown />
                    </HStack>
                )}
            </HStack>
            <MobileSidebar isOpened={isSidebarOpened} onClose={() => setIsSidebarOpened(false)} />
        </HStack>
    );
};
