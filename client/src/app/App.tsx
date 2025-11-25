import { Suspense, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { NextUIProvider } from '@nextui-org/react';
import { useNavigate } from 'react-router-dom';

import {
    getIsUpdateAvailable,
    ServiceUpdatedActions,
    ServiceUpdatedBanner,
} from '@/features/ServiceUpdated';
import { AppRouter } from '@/app/providers/AppRouter';
import { Toaster } from '@/widgets/Toaster';
import { Navbar } from '@/widgets/Navbar';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { getUserData, getUserDataService } from '@/entities/User';
import { USER_ACCESS_TOKEN } from '@/shared/const';
import { useWindowWidth } from '@/shared/lib/hooks/useWindowWidth';

export const App = () => {
    const { width } = useWindowWidth();

    const navigate = useNavigate();

    const dispatch = useAppDispatch();
    const userData = useSelector(getUserData);
    const isUpdateAvailable = useSelector(getIsUpdateAvailable) && width > 1010;

    useEffect(() => {
        const token = localStorage.getItem(USER_ACCESS_TOKEN);
        if (token) {
            dispatch(getUserDataService());
        }

        dispatch(ServiceUpdatedActions.checkUpdateAvailability());
    }, [dispatch]);

    return (
        <NextUIProvider navigate={navigate}>
            <div className="app">
                <Suspense fallback="">
                    {isUpdateAvailable ? <ServiceUpdatedBanner /> : null}
                    {userData?.id && <Navbar />}
                    <AppRouter />
                    <Toaster />
                </Suspense>
            </div>
        </NextUIProvider>
    );
};
