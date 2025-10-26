import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

import classes from './AppLink.module.scss';

import { classNames } from '@/shared/lib/classNames';

interface AppLinkProps {
    className?: string;
    to: string;
    children: ReactNode;
    target?: string;
}

export const AppLink = (props: AppLinkProps) => {
    const { className, target, children, to } = props;

    const { pathname } = useLocation();

    const mods = {
        [classes.active]: pathname === to,
    };

    return (
        <Link
            to={to}
            target={target}
            className={classNames(classes.AppLink, mods, ['!text-accent', className])}
        >
            {children}
        </Link>
    );
};
