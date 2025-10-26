import { DetailedHTMLProps, HTMLAttributes, ReactNode } from 'react';

import classes from './Flex.module.scss';

import { classNames, Mods } from '@/shared/lib/classNames';

export type FlexDirection = 'row' | 'column';
export type FlexAlign = 'center' | 'start' | 'end' | 'stretch';
export type FlexJustify = 'center' | 'start' | 'end' | 'between';

const alignClasses: Record<FlexAlign, string> = {
    center: classes.alignCenter,
    stretch: classes.alignStretch,
    end: classes.alignEnd,
    start: classes.alignStart,
};

const justifyClasses: Record<FlexJustify, string> = {
    center: classes.justifyCenter,
    end: classes.justifyEnd,
    start: classes.justifyStart,
    between: classes.justifyBetween,
};

const directionClasses: Record<FlexDirection, string> = {
    column: classes.directionColumn,
    row: classes.directionRow,
};

type DivProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export interface FlexProps extends DivProps {
    className?: string;
    children?: ReactNode;
    direction?: FlexDirection;
    align?: FlexAlign;
    justify?: FlexJustify;
    gap?: string;
    maxW?: boolean;
    maxH?: boolean;
    flexGrow?: boolean;
}

export const Flex = (props: FlexProps) => {
    const {
        className,
        children,
        align = 'center',
        justify = 'start',
        direction = 'row',
        gap = '4px',
        maxW,
        maxH,
        flexGrow,
        style,
    } = props;

    const mods: Mods = {
        [classes.maxW]: maxW,
        [classes.maxH]: maxH,
        [classes.flexGrow]: flexGrow,
    };

    const classesMapper = [
        className,
        justifyClasses[justify],
        alignClasses[align],
        directionClasses[direction],
    ];

    return (
        <div
            {...props}
            style={{ gap, ...style }}
            className={classNames(classes.Flex, mods, classesMapper)}
        >
            {children}
        </div>
    );
};
