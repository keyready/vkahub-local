import ContentLoader from 'react-content-loader';
import { useSelector } from 'react-redux';

import { getCurrentTheme } from '@/widgets/ThemeSwitcher';

interface SkeletonProps {
    width: number | string;
    height: number | string;
    rounded?: number | string;
    className?: string;
}

export const Skeleton = (props: SkeletonProps) => {
    const { className, height, rounded = 4, width } = props;

    const theme = useSelector(getCurrentTheme);

    return (
        <ContentLoader
            speed={2}
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            backgroundColor={theme === 'light' ? '#E6F3F4' : '#3f3f46'}
            foregroundColor={theme === 'light' ? '#E4E4E7' : '#444'}
            className={className}
        >
            <rect x="0" y="0" rx={rounded} ry={rounded} width="100%" height="100%" />
        </ContentLoader>
    );
};
