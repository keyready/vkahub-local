import { ReactNode } from 'react';

import classes from './TextButton.module.scss';

import { classNames } from '@/shared/lib/classNames';

interface TextButtonProps {
    className?: string;
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
}

export const TextButton = (props: TextButtonProps) => {
    const { className, disabled, children, onClick } = props;

    return (
        <button
            type="button"
            onClick={onClick}
            className={classNames(
                classes.TextButton,
                {
                    'opacity-40 underline-none': disabled,
                },
                [className, 'underline underline-offset-4 hover:opacity-50 duration-200'],
            )}
        >
            {children}
        </button>
    );
};
