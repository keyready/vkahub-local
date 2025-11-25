import { Button, cn, Input } from '@nextui-org/react';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RiAccountBoxLine, RiLockPasswordLine, RiMoonLine, RiSunLine } from '@remixicon/react';

import { loginUser } from '../../model/services/authServices/loginUser';
import { getUserAuthError, getUserIsLoading } from '../../model/selectors/UserSelectors';
import { getUserDataService } from '../../model/services/profileServices/getUserData';
import { UserActions } from '../../model/slice/UserSlice';

import { classNames } from '@/shared/lib/classNames';
import { VStack } from '@/shared/ui/Stack';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { RoutePath } from '@/shared/config/routeConfig';
import { TextButton } from '@/shared/ui/TextButton';
import { getCurrentTheme, ThemeSwitcherActions } from '@/widgets/ThemeSwitcher';

interface LoginFormProps {
    className?: string;
    onRegisterClick: () => void;
    onRecoveryClick: () => void;
}

export const LoginForm = (props: LoginFormProps) => {
    const { className, onRegisterClick, onRecoveryClick } = props;

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const isUserLoading = useSelector(getUserIsLoading);
    const userLoginError = useSelector(getUserAuthError);
    const isDark = useSelector(getCurrentTheme) === 'dark';

    const [login, setLogin] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const isButtonDisabled = useMemo(
        () => (import.meta.env.DEV ? false : !login || !password || login.includes('@')),
        [login, password],
    );

    useEffect(() => {
        dispatch(UserActions.clearAuthError());
    }, [dispatch, login, password]);

    useEffect(() => {
        if (userLoginError === 'Invalid password') {
            setPassword('');
        }
    }, [userLoginError]);

    const renderAuthErrorText = useMemo(() => {
        switch (userLoginError) {
            case 'Invalid password':
                return 'Неверный пароль!';
            case 'Username not found':
                return 'Пользователь не найден';
            default:
                return 'Серверная ошибка, попробуйте позже';
        }
    }, [userLoginError]);

    const handleFormSubmit = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            dispatch(UserActions.clearAuthError());

            const result = await dispatch(
                loginUser({
                    username: login,
                    password,
                }),
            );

            if (result.meta.requestStatus === 'fulfilled') {
                await dispatch(getUserDataService());
                dispatch(UserActions.clearAuthError());
                navigate(RoutePath.feed);
            }
        },
        [dispatch, login, navigate, password],
    );

    const handleToggleTheme = useCallback(() => {
        dispatch(ThemeSwitcherActions.toggleTheme());
    }, [dispatch]);

    return (
        <VStack className={classNames('', {}, [className])} maxW align="center" justify="center">
            <form onSubmit={handleFormSubmit} className="w-full">
                <VStack maxW align="center" gap="12px">
                    <h1 className="text-2xl text-main leading-none">
                        Для продолжения работы <br /> <span className="font-bold">необходимо</span>{' '}
                        авторизоваться
                    </h1>
                    <Input
                        isDisabled={isUserLoading}
                        value={login}
                        onChange={(event) => setLogin(event.target.value)}
                        autoFocus
                        required
                        label="Ваш логин"
                    />
                    <Input
                        color={userLoginError === 'Invalid password' ? 'danger' : 'default'}
                        isDisabled={isUserLoading}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        type="password"
                        label="Ваш пароль"
                    />

                    {userLoginError && (
                        <p className="text-left w-full italic text-red-500">
                            {renderAuthErrorText}
                        </p>
                    )}

                    <Button
                        isDisabled={userLoginError === 'Invalid password' || isButtonDisabled}
                        isLoading={isUserLoading}
                        type="submit"
                        className={cn(
                            'text-white self-end',
                            userLoginError ? 'bg-danger' : 'dark:text-black bg-accent',
                        )}
                    >
                        {isUserLoading ? 'Ожидайте...' : 'Войти!'}
                    </Button>
                </VStack>

                <VStack maxW>
                    <TextButton className="flex gap-1 items-center" onClick={onRecoveryClick}>
                        <RiLockPasswordLine size={16} />
                        <p> Я забыл пароль</p>
                    </TextButton>
                    <TextButton className="flex gap-1 items-center" onClick={onRegisterClick}>
                        <RiAccountBoxLine size={16} />
                        <p>У меня нет аккаунта</p>
                    </TextButton>
                    <TextButton className="flex gap-1 items-center" onClick={handleToggleTheme}>
                        {isDark ? <RiSunLine size={16} /> : <RiMoonLine size={16} />}
                        <p>Включить {isDark ? 'светлую' : 'темную'} тему</p>
                    </TextButton>
                </VStack>
            </form>
        </VStack>
    );
};
