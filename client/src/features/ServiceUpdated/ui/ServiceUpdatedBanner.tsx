import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { getIsUpdateAvailable } from '../model/selectors/ServiceUpdateSelectors';
import { ServiceUpdatedActions } from '../model/slice/ServiceUpdatedSlice';

import classes from './ServiceUpdatedBanner.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { HStack } from '@/shared/ui/Stack';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { RoutePath } from '@/shared/config/routeConfig';
import { TextButton } from '@/shared/ui/TextButton';

interface ServiceUpdatedProps {
    className?: string;
}

export const ServiceUpdatedBanner = (props: ServiceUpdatedProps) => {
    const { className } = props;

    const isUpdateAvailable = useSelector(getIsUpdateAvailable);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleCloseBannerClick = useCallback(() => {
        dispatch(ServiceUpdatedActions.updateApplication());
    }, [dispatch]);

    const handleVisitWhatsnewPage = useCallback(() => {
        dispatch(ServiceUpdatedActions.updateApplication());
        navigate(RoutePath.changelogs);
    }, [dispatch, navigate]);

    return (
        <HStack
            justify="center"
            gap="12px"
            maxW
            className={classNames(
                classes.ServiceUpdatedBanner,
                {
                    hidden: !isUpdateAvailable,
                },
                [className],
            )}
        >
            <p>Вышло крупное обновление!</p>
            <TextButton
                className="hover:opacity-100 hover:bg-green-100 hover:bg-opacity-30 rounded-small p-1 duration-200 text-green-400"
                onClick={handleVisitWhatsnewPage}
            >
                Отлично! Что изменилось?
            </TextButton>
            <TextButton
                className="hover:opacity-100 hover:bg-red-100 hover:bg-opacity-30 rounded-small p-1 duration-200 text-red-400"
                onClick={handleCloseBannerClick}
            >
                Скрыть
            </TextButton>
        </HStack>
    );
};
