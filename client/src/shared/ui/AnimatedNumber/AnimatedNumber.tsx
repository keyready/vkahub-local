import AnimatedNumber from 'react-awesome-animated-number';

import 'react-awesome-animated-number/dist/index.css';
import { classNames } from '@/shared/lib/classNames';

interface NumberAnimationProps {
    className?: string;
    children: any;
}

export const NumberAnimation = (props: NumberAnimationProps) => {
    const { className, children } = props;

    return (
        <AnimatedNumber
            className={classNames('text-l text-accent font-bold', {}, [className])}
            value={children}
            hasComma
            size={48}
            duration={500}
        />
    );
};
