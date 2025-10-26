import { useSelector } from 'react-redux';
import { Input } from '@nextui-org/react';

import classes from './AccountSettings.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { VStack } from '@/shared/ui/Stack';
import { getUserData } from '@/entities/User';

interface AccountSettingsProps {
    className?: string;
}

export const AccountSettings = (props: AccountSettingsProps) => {
    const { className } = props;

    const userData = useSelector(getUserData);

    return (
        <VStack gap="24px" maxW className={classNames(classes.AccountSettings, {}, [className])}>
            <VStack maxW>
                <h1 className="text-primary text-l font-bold">Данные входа в аккаунт</h1>
                <p className="italic">Эти данные пока нельзя изменить</p>
            </VStack>

            <VStack maxW gap="12px">
                <Input
                    label="Имя пользователя"
                    value={userData?.username || ''}
                    isDisabled
                    size="sm"
                />
                {/* <Input label="Почта" value={userData?.mail || ''} isDisabled size="sm" /> */}
            </VStack>
        </VStack>
    );
};
