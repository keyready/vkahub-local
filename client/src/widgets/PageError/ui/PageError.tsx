import { useLocation, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

import classes from './PageError.module.scss';

import { VStack } from '@/shared/ui/Stack';
import { Page } from '@/widgets/Page';
import { TextButton } from '@/shared/ui/TextButton';
import { RoutePath } from '@/shared/config/routeConfig';

export const PageError = () => {
    const navigate = useNavigate();

    const { pathname } = useLocation();

    const reloadPage = () => {
        navigate(RoutePath.main);
        // eslint-disable-next-line no-restricted-globals
        location.reload();
    };

    const handleReportNavigateClick = useCallback(() => {
        navigate(`${RoutePath.feedback}?tab=bug-report&from=${pathname}`);
        // eslint-disable-next-line no-restricted-globals
        location.reload();
    }, [navigate]);

    return (
        <Page className={classes.PageError}>
            <VStack maxW maxH align="center" justify="center">
                <VStack className={classes.wrapper} align="center" justify="center">
                    <h1 className={classes.error500Title}>Ошибка клиентского приложения</h1>
                    <TextButton onClick={reloadPage} className="text-primary">
                        Вернитесь на главную, и попробуйте снова
                    </TextButton>
                    <TextButton onClick={handleReportNavigateClick} className="text-primary">
                        или сообщите о проблеме, чтобы никогда больше не видеть эту ошибку
                    </TextButton>
                </VStack>
            </VStack>
        </Page>
    );
};
