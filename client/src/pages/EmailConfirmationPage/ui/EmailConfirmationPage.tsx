import { memo, useCallback, useEffect, useState } from 'react';
import { Button, Image } from '@nextui-org/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import classes from './EmailConfirmationPage.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { Page } from '@/widgets/Page';
import { HStack, VStack } from '@/shared/ui/Stack';
import { Helmet } from '@/widgets/Helmet';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { confirmEmail, getUserIsLoading } from '@/entities/User';
import { toastDispatch } from '@/widgets/Toaster';
import { RoutePath } from '@/shared/config/routeConfig';
import { getCurrentTheme } from '@/widgets/ThemeSwitcher';

interface EmailConfirmationPageProps {
    className?: string;
}

const EmailConfirmationPage = memo((props: EmailConfirmationPageProps) => {
    const { className } = props;

    const [params] = useSearchParams();
    const [code, setCode] = useState<string>('');

    const dispatch = useAppDispatch();
    const isUserLoading = useSelector(getUserIsLoading);
    const navigate = useNavigate();

    const isDark = useSelector(getCurrentTheme) === 'dark';

    useEffect(() => {
        const code = params.get('code');
        if (code) {
            setCode(code);
        }
    }, [dispatch, params]);

    const handleConfirmationClick = useCallback(async () => {
        const result = await toastDispatch(dispatch(confirmEmail(code)), {
            success: 'Почта подтверждена!',
            loading: 'Подтверждаем почту...',
            error: 'Код неверный или произошла ошибка',
        });

        if (result.meta.requestStatus === 'fulfilled') {
            navigate(RoutePath.feed);
        }
    }, [code, dispatch, navigate]);

    if (!code) {
        return (
            <Page className={classNames(classes.EmailConfirmationPage, {}, [className])}>
                <Helmet
                    title="Подтверждение почты"
                    description="Подтвердите Вашу почту для продолжения работы в сервисе"
                />

                <VStack flexGrow maxW align="center" justify="center" gap="24px">
                    <HStack maxW justify="center" align="center">
                        <Image
                            width={512}
                            src={isDark ? '/static/logo.webp' : '/static/logo-light.webp'}
                        />
                    </HStack>

                    <VStack align="center" maxW>
                        <h1 className="text-xl text-primary font-bold">
                            Не найден код подтверждения. Попробуйте снова
                        </h1>
                    </VStack>
                </VStack>
            </Page>
        );
    }

    return (
        <Page className={classNames(classes.EmailConfirmationPage, {}, [className])}>
            <Helmet
                title="Подтверждение почты"
                description="Подтвердите Вашу почту для продолжения работы в сервисе"
            />

            <VStack flexGrow maxW align="center" justify="center" gap="24px">
                <HStack maxW justify="center" align="center">
                    <Image width={512} src="/static/logo.webp" />
                </HStack>

                <VStack align="center" maxW>
                    <h1 className="text-xl text-primary font-bold">
                        Подтвердите Вашу почту <br /> для продолжения работы в сервисе
                    </h1>
                    <h1 className="text-l text-primary">
                        После успешного подтверждения Вы будете перенаправлены в Личный кабинет
                        <br /> для уточнения персональных данных
                    </h1>
                </VStack>

                <Button isLoading={isUserLoading} onClick={handleConfirmationClick} type="button">
                    {isUserLoading ? 'Ожидайте...' : 'Нажмите, чтобы подтвердить почту'}
                </Button>
            </VStack>
        </Page>
    );
});

export default EmailConfirmationPage;
