import { Button, cn, Input } from '@nextui-org/react';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RiAccountBoxLine, RiLockPasswordLine, RiMoonLine, RiSunLine } from '@remixicon/react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

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
import { registrationSchema } from '@/entities/User/model/types/validationSchemas';

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

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<{ username: string; password: string }>({
        resolver: yupResolver(registrationSchema),
        mode: 'onChange',
    });

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
        async (user: { username: string; password: string }) => {
            const result = await dispatch(
                loginUser({
                    username: user.username,
                    password: user.password,
                }),
            );

            if (result.meta.requestStatus === 'fulfilled') {
                await dispatch(getUserDataService());
                dispatch(UserActions.clearAuthError());
                navigate(RoutePath.feed);
            }
        },
        [dispatch, navigate],
    );

    const handleToggleTheme = useCallback(() => {
        dispatch(ThemeSwitcherActions.toggleTheme());
    }, [dispatch]);

    return (
        <VStack className={classNames('', {}, [className])} maxW align="center" justify="center">
            <form onSubmit={handleSubmit(handleFormSubmit)} className="w-full">
                <VStack maxW align="center" gap="12px">
                    <h1 className="text-2xl text-main leading-none">
                        Для продолжения работы <br /> <span className="font-bold">необходимо</span>{' '}
                        авторизоваться
                    </h1>

                    <Controller
                        render={({ field }) => (
                            <Input
                                isDisabled={isUserLoading}
                                autoFocus
                                required
                                label="Ваш логин"
                                value={field.value}
                                onValueChange={field.onChange}
                                isInvalid={Boolean(errors.username?.message)}
                                errorMessage={errors.username?.message}
                                classNames={{
                                    errorMessage: 'text-start text-red-400 font-bold',
                                }}
                            />
                        )}
                        name="username"
                        control={control}
                    />

                    <Controller
                        render={({ field }) => (
                            <Input
                                color={userLoginError === 'Invalid password' ? 'danger' : 'default'}
                                isDisabled={isUserLoading}
                                required
                                type="password"
                                label="Ваш пароль"
                                value={field.value}
                                onValueChange={field.onChange}
                                isInvalid={Boolean(errors.password?.message)}
                                errorMessage={errors.password?.message}
                                classNames={{
                                    errorMessage: 'text-start text-red-400 font-bold',
                                }}
                            />
                        )}
                        control={control}
                        name="password"
                    />

                    {userLoginError && (
                        <p className="text-left w-full italic text-red-500">
                            {renderAuthErrorText}
                        </p>
                    )}

                    <Button
                        isDisabled={!isValid}
                        isLoading={isUserLoading}
                        type="submit"
                        className={cn('text-white self-end')}
                        color="primary"
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
