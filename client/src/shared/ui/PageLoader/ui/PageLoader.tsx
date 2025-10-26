import classes from './PageLoader.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { Spinner } from '@/shared/ui/Spinner';
import { Page } from '@/widgets/Page';

interface PageLoaderProps {
    className?: string;
}

export const PageLoader = ({ className }: PageLoaderProps) => (
    <Page className={classNames(classes.PageLoader, {}, [className])}>
        <Spinner height="128" width="128" fill="#6490FF" />
    </Page>
);
