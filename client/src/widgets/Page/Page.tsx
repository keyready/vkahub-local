import { memo, ReactNode, useEffect } from 'react';
import { useSelector } from 'react-redux';

import classes from './Page.module.scss';

import { classNames, Mods } from '@/shared/lib/classNames';
import { getIsUpdateAvailable } from '@/features/ServiceUpdated';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { PageScrollActions } from '@/features/PageScroll';

interface PageProps {
    className?: string;
    children?: ReactNode;
}

export const Page = memo((props: PageProps) => {
    const { className, children } = props;

    const isUpdateAvailable = useSelector(getIsUpdateAvailable);

    const dispatch = useAppDispatch();

    useEffect(() => {
        const pageWrapper = document.querySelector('#page-wrapper');

        const handleScroll = (event: any) => {
            dispatch(PageScrollActions.setScrollPosition(pageWrapper?.scrollTop || 0));
        };

        if (pageWrapper) {
            pageWrapper.addEventListener('scroll', handleScroll);
        }
        return () => {
            pageWrapper?.removeEventListener('scroll', handleScroll);
        };
    }, [dispatch]);

    const mods: Mods = {
        [classes.updatedBannerVisible]: isUpdateAvailable,
    };

    return (
        <section id="page-wrapper" className={classNames(classes.Page, mods, [className])}>
            {children}
        </section>
    );
});
