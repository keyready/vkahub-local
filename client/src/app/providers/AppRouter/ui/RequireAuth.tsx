import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useMemo } from 'react';

import { getUserData, getUserRoles, UserRoles } from '@/entities/User';
import { RoutePath } from '@/shared/config/routeConfig';

interface RequireAuthProps {
    children: JSX.Element;
    roles?: UserRoles[];
}
export function RequireAuth({ children, roles }: RequireAuthProps) {
    const userData = useSelector(getUserData);
    const userRoles = useSelector(getUserRoles);
    const navigate = useNavigate();

    const currentLocation = useLocation();

    const hasRequiredRoles = useMemo(() => {
        if (!roles) return true;
        if (!userData?.recoveryQuestion) return false;

        return roles.every((requiredRole) => userRoles?.includes(requiredRole));
    }, [roles, userData?.recoveryQuestion, userRoles]);

    useEffect(() => {
        if (userRoles.includes(UserRoles.BANNED) && currentLocation.pathname !== RoutePath.banned) {
            navigate(RoutePath.banned);
        }
    }, [currentLocation.pathname, navigate, userRoles]);

    if (!hasRequiredRoles) {
        return <Navigate to={RoutePath.feed} state={{ from: currentLocation }} replace />;
    }

    if (!userData) {
        return <Navigate to={RoutePath.login} state={{ from: currentLocation }} replace />;
    }

    return children;
}
