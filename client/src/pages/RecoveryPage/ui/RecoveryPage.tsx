import { FormEvent, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Image, Input } from '@nextui-org/react';
import { useSelector } from 'react-redux';

import classes from './RecoveryPage.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { Page } from '@/widgets/Page';
import { RoutePath } from '@/shared/config/routeConfig';
import { HStack, VStack } from '@/shared/ui/Stack';
import { getUserIsLoading } from '@/entities/User';
import { Helmet } from '@/widgets/Helmet';
import { getCurrentTheme } from '@/widgets/ThemeSwitcher';

interface RecoveryPageProps {
    className?: string;
}

const RecoveryPage = memo((props: RecoveryPageProps) => {
    const { className } = props;

    const [params] = useSearchParams();
    const [password, setPassword] = useState<string>('');
    const [confirmedPassword, setConfirmedPassword] = useState<string>('');
    const [_, setRecoveryToken] = useState<string>('');

    const navigate = useNavigate();

    const isUserLoading = useSelector(getUserIsLoading);
    const isDark = useSelector(getCurrentTheme) === 'dark';

    const isButtonDisabled = useMemo(
        () => !password || !confirmedPassword || password !== confirmedPassword || isUserLoading,
        [confirmedPassword, isUserLoading, password],
    );

    useEffect(() => {
        const token = params.get('recovery_token');
        if (token) {
            setRecoveryToken(token);
        } else {
            navigate(RoutePath.login);
        }
    }, [navigate, params]);

    const handleFormSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
    }, []);

    return (
        <Page className={classNames(classes.RecoveryPage, {}, [className])}>
            <Helmet
                title="Восстановление пароля | Безопасность аккаунта"
                description="Восстановите пароль к вашему аккаунту в системе учета научной деятельности. Убедитесь в безопасности вашего доступа."
            />

            <VStack flexGrow maxW justify="center" align="center" gap="24px">
                <HStack maxW justify="center" align="center">
                    <Image src={isDark ? '/static/logo.webp' : '/static/logo-light.webp'} />
                </HStack>

                <h1 className="text-2xl text-center w-full text-main leading-none">
                    Восстановление доступа к четной записи
                </h1>

                <form onSubmit={handleFormSubmit}>
                    <VStack gap="12px" className="w-2/4 p-5 rounded-xl">
                        <Input
                            isRequired
                            isDisabled={isUserLoading}
                            onChange={(event) => setPassword(event.target.value)}
                            value={password}
                            type="password"
                            label="Новый пароль"
                        />
                        <Input
                            isRequired
                            isDisabled={isUserLoading}
                            onChange={(event) => setConfirmedPassword(event.target.value)}
                            value={confirmedPassword}
                            type="password"
                            label="Повторите пароль"
                        />
                        <Button
                            isLoading={isUserLoading}
                            isDisabled={isButtonDisabled}
                            type="submit"
                            className="dark:text-black text-white bg-accent self-end"
                        >
                            {isUserLoading ? 'Ожидайте...' : 'Сбросить пароль'}
                        </Button>
                    </VStack>
                </form>
            </VStack>
        </Page>
    );
});

export default RecoveryPage;
