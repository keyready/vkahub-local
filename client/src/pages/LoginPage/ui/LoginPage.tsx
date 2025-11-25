import { memo, useState } from 'react';
import { Image } from '@nextui-org/react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

import classes from './LoginPage.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { Page } from '@/widgets/Page';
import {
    getUserData,
    getUserIsLoading,
    LoginForm,
    RecoveryPasswordModal,
    RegisterModal,
} from '@/entities/User';
import { HStack, VStack } from '@/shared/ui/Stack';
import { RoutePath } from '@/shared/config/routeConfig';
import { Helmet } from '@/widgets/Helmet';
import { USER_ACCESS_TOKEN } from '@/shared/const';
import { getCurrentTheme } from '@/widgets/ThemeSwitcher';

interface LoginPageProps {
    className?: string;
}

const LoginPage = memo((props: LoginPageProps) => {
    const { className } = props;

    const [isRegisterModalOpened, setIsRegisterModalOpened] = useState<boolean>(false);
    const [isRecoveryModalOpened, setIsRecoveryModalOpened] = useState<boolean>(false);

    const userData = useSelector(getUserData);
    const location = useLocation();
    const isUserLoading = useSelector(getUserIsLoading);
    const isDark = useSelector(getCurrentTheme) === 'dark';

    if (localStorage.getItem(USER_ACCESS_TOKEN) && isUserLoading) {
        return (
            <Page className={classNames(classes.LoginPage, {}, [className, 'justify-center'])}>
                <Helmet
                    title="Вход в систему"
                    description="Авторизуйтесь в системе учета и контроля научной деятельности обучающихся"
                />
                <VStack maxW align="center" justify="center" gap="24px">
                    <HStack maxW justify="center" align="center">
                        <Image src="/static/logo.webp" />
                    </HStack>
                    <h1 className="text-2xl text-main leading-none">
                        Пытаемся вас авторизовать...
                    </h1>
                </VStack>
            </Page>
        );
    }

    if (userData) {
        let originLocation = '';
        if (location.state?.from) {
            const { pathname, search } = location.state.from;
            originLocation = pathname + search;
        }
        return <Navigate to={originLocation || RoutePath.feed} />;
    }

    return (
        <Page className={classNames(classes.LoginPage, {}, [className])}>
            <Helmet
                title="Вход в систему"
                description="Авторизуйтесь в системе учета и контроля научной деятельности обучающихся"
            />

            <VStack flexGrow maxW justify="center" gap="24px">
                <HStack maxW justify="center" align="center">
                    <Image
                        width={512}
                        src={isDark ? '/static/logo.webp' : '/static/logo-light.webp'}
                    />
                </HStack>
                <LoginForm
                    onRecoveryClick={() => setIsRecoveryModalOpened(true)}
                    onRegisterClick={() => setIsRegisterModalOpened(true)}
                />
                <RegisterModal
                    isOpened={isRegisterModalOpened}
                    setIsOpened={setIsRegisterModalOpened}
                />
                 <RecoveryPasswordModal 
                    isOpened={isRecoveryModalOpened} 
                    setIsOpened={setIsRecoveryModalOpened} 
                 /> 
            </VStack>
        </Page>
    );
});

export default LoginPage;
