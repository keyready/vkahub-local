import {
    ContextMenu as OriginalContextMenu,
    ContextMenuItem,
    ContextMenuTrigger,
} from 'rctx-contextmenu';
import { ReactNode } from 'react';

import { HStack } from '@/shared/ui/Stack';
import { classNames } from '@/shared/lib/classNames';

interface ContextMenuItemProps {
    text: string;
    onClick?: () => void;
    icon?: ReactNode;
    isDisabled?: boolean;
    className?: string;
}

interface ContextMenuProps {
    children?: ReactNode;
    items: ContextMenuItemProps[];
    id: string;
    reverse?: boolean;
}

export const ContextMenu = (props: ContextMenuProps) => {
    const { items, children, id, reverse } = props;

    return (
        <>
            <ContextMenuTrigger
                className={`flex flex-row w-full ${reverse ? 'justify-end' : 'justify-start'}`}
                id={id}
            >
                {children}
            </ContextMenuTrigger>

            <OriginalContextMenu className="rounded-xl p-2 shadow-2xl bg-default" id={id}>
                {items.map((item) => (
                    <ContextMenuItem
                        disabled={item.isDisabled}
                        key={item.text}
                        onClick={item.onClick}
                        className={classNames(
                            `rounded-md py-1 px-5 text-start hover:bg-input-bg ${
                                item.icon ? 'pl-1' : 'pl-[28px]'
                            }`,
                            {},
                            [item.className],
                        )}
                    >
                        <HStack gap="8px">
                            {item.icon}
                            {item.text}
                        </HStack>
                    </ContextMenuItem>
                ))}
            </OriginalContextMenu>
        </>
    );
};
