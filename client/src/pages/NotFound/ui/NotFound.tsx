import React from 'react';
import { useSelector } from 'react-redux';

import classes from './NotFound.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { Page } from '@/widgets/Page';
import { VStack } from '@/shared/ui/Stack';
import { AppLink } from '@/shared/ui/AppLink';
import { RoutePath } from '@/shared/config/routeConfig';
import { getUserData } from '@/entities/User';

interface NotFoundProps {
    className?: string;
}

export const NotFound = ({ className }: NotFoundProps) => {
    const userData = useSelector(getUserData);

    return (
        <Page
            className={classNames(classes.page, { [classes.fullPage]: !userData?.id }, [className])}
        >
            <VStack maxH align="center" justify="center" maxW gap="8px">
                <VStack gap="12px" align="center" className={classes.NotFound}>
                    <h1 className="dark:text-primary text-main text-2xl text-center font-bold">
                        Запрашиваемый ресурс не найден
                    </h1>
                    <AppLink className="dark:text-primary text-main text-l" to={RoutePath.main}>
                        Вернитесь на главную страницу
                    </AppLink>
                </VStack>
            </VStack>
        </Page>
    );
};
