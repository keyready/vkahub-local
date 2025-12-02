import { Accordion, AccordionItem, Checkbox, cn } from '@nextui-org/react';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { getUserSettings } from '../../../model/selectors/UserSelectors';

import { VStack } from '@/shared/ui/Stack';
import { Switch, SwitchOption } from '@/shared/ui/Switch';
import { getCurrentTheme, Theme, ThemeSwitcherActions } from '@/widgets/ThemeSwitcher';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { UserActions } from '@/entities/User/model/slice/UserSlice';

export const UserSettingsTab = ({ className }: { className?: string }) => {
    const theme = useSelector(getCurrentTheme);

    const dispatch = useAppDispatch();
    const settings = useSelector(getUserSettings);

    const [guidelines, setGuidelines] = useState<string>('true');

    useEffect(() => {
        setGuidelines(String(settings?.guidelines.some((gl) => gl.enabled)));
    }, [settings?.guidelines]);

    const handleChangeTheme = useCallback(
        (value: Theme) => {
            dispatch(ThemeSwitcherActions.setTheme(value));
        },
        [dispatch],
    );

    const handleChangeGuideline = useCallback(
        (state: boolean, value: string) => {
            dispatch(
                UserActions.setSettings({
                    ...settings,
                    guidelines: [...settings?.guidelines].map((gl) =>
                        gl.value === value ? { ...gl, enabled: state } : gl,
                    ),
                }),
            );
        },
        [dispatch, settings],
    );

    const handleChangeAnimations = useCallback(
        (value: 'transitions' | 'all') => {
            dispatch(
                UserActions.setSettings({
                    ...settings,
                    animation: value,
                }),
            );
        },
        [dispatch, settings],
    );

    const handleChangeGuidelines = useCallback(
        (val: string) => {
            dispatch(
                UserActions.setSettings({
                    ...settings,
                    guidelines: [...settings?.guidelines].map((gl) => ({
                        ...gl,
                        enabled: val === 'true',
                    })),
                }),
            );
            setGuidelines(val);
        },
        [dispatch, settings],
    );

    const transitionsOptions: SwitchOption<'all' | 'transitions'>[] = [
        { value: 'all', label: 'Все' },
        { value: 'transitions', label: 'Анимации' },
    ];

    const guidelinesOptions: SwitchOption[] = [
        { value: 'true', label: 'Включить' },
        { value: 'false', label: 'Выключить' },
    ];

    const themeOptions: SwitchOption<Theme>[] = [
        { value: 'light', label: 'Светлая' },
        { value: 'dark', label: 'Темная' },
        { value: 'auto', label: 'Как в системе' },
    ];

    return (
        <VStack gap="24px" maxW className={cn(className)}>
            <VStack maxW>
                <h1 className="text-primary text-l font-bold">Настройки</h1>
                <p className="italic">
                    Некоторые настройки, чтобы Вам было приятнее пользоваться сайтом
                </p>
                <p className="text-danger-600 italic">
                    Данный раздел пока не работает, находится в тестовом режиме
                </p>
            </VStack>

            <div className="w-full flex flex-col gap-4">
                <div className=" flex items-center gap-3">
                    <p className="text-[16px] w-[200px]">Тема приложения</p>
                    <Switch
                        disabledKeys={['auto']}
                        options={themeOptions}
                        value={theme}
                        onChange={handleChangeTheme}
                    />
                </div>
                <div className=" flex items-center gap-3">
                    <p className="text-[16px] w-[200px]">Анимации</p>
                    <Switch
                        options={transitionsOptions}
                        value={settings?.animation}
                        onChange={handleChangeAnimations}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <p className="text-[16px] w-[200px]">Показывать обучение</p>
                        <Switch
                            options={guidelinesOptions}
                            value={guidelines}
                            onChange={handleChangeGuidelines}
                        />
                    </div>
                    <div
                        className={guidelines === 'true' ? 'opacity-100 block' : 'hidden opacity-0'}
                    >
                        <Accordion>
                            <AccordionItem
                                classNames={{
                                    trigger: 'flex-row-reverse p-0',
                                    title: 'text-[16px]',
                                }}
                                title="Показать настройки"
                            >
                                <div className="flex flex-col gap-2">
                                    {settings?.guidelines.map(
                                        ({ value, label, level, enabled }) => (
                                            <Checkbox
                                                isSelected={enabled}
                                                onValueChange={(state) =>
                                                    handleChangeGuideline(state, value)
                                                }
                                                classNames={{
                                                    wrapper: cn(
                                                        'before:bg-default-100',
                                                        'group-data-[hover=true]:before:bg-default-300',
                                                        level === 3
                                                            ? 'ml-16'
                                                            : level === 2
                                                            ? 'ml-8'
                                                            : '',
                                                    ),
                                                }}
                                                value={value}
                                                key={value}
                                            >
                                                {label}
                                            </Checkbox>
                                        ),
                                    )}
                                </div>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>
            </div>
        </VStack>
    );
};
