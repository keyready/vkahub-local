'use client';

import { Switch } from '@nextui-org/react';
import { useSelector } from 'react-redux';
import { RiMoonLine, RiSunLine } from '@remixicon/react';

import { getCurrentTheme } from '../model/selectors/getThemeSelectors';
import { ThemeSwitcherActions } from '../model/slice/ThemeSwitcherSlice';

import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';

export const ThemeSwitcher = () => {
    const dispatch = useAppDispatch();
    const theme = useSelector(getCurrentTheme);
    const isDarkTheme = theme === 'dark';

    const handleChangeTheme = (state: boolean) => {
        dispatch(ThemeSwitcherActions.setTheme(state ? 'dark' : 'light'));
    };

    return (
        <Switch
            size="sm"
            classNames={{
                label: 'flex items-center gap-2 text-accent',
                base: 'w-full justify-between max-w-none flex-row-reverse',
            }}
            isSelected={isDarkTheme}
            onValueChange={handleChangeTheme}
        >
            {isDarkTheme ? (
                <RiMoonLine size={14} className="text-accent" />
            ) : (
                <RiSunLine size={14} className="text-accent" />
            )}
            <span>Темная тема</span>
        </Switch>
    );
};
