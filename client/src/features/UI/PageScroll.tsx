import { memo } from 'react';

import classes from './PageScrollCard.module.scss';

import { classNames } from '@/shared/lib/classNames';

interface PageScrollCardProps {
    className?: string;
}

export const PageScrollCard = memo((props: PageScrollCardProps) => {
    const { className } = props;

    return (
        <div className={classNames(classes.PageScrollCard, {}, [className])}>PageScrollCard</div>
    );
});
