import { Button, Input } from '@nextui-org/react';
import React, { ChangeEvent, useCallback, useState } from 'react';

import { parseEvent } from '../../../model/services/parseEvent';

import { classNames } from '@/shared/lib/classNames';
import { HStack, VStack } from '@/shared/ui/Stack';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { toastDispatch } from '@/widgets/Toaster';

interface CreateEventParseFormProps {
    className?: string;
}

export const CreateEventParseForm = (props: CreateEventParseFormProps) => {
    const { className } = props;

    const dispatch = useAppDispatch();

    const [url, setUrl] = useState<string>('');

    const handleUrlChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        let originalUrl = event.target.value;

        if (originalUrl.includes('https://')) {
            originalUrl = originalUrl.replace('https://', '');
        }
        if (originalUrl.includes('www.')) {
            originalUrl = originalUrl.replace('www.', '');
        }
        setUrl(originalUrl);
    }, []);

    const handleParseEvent = useCallback(async () => {
        await toastDispatch(dispatch(parseEvent(url)), {
            loading: 'Производится парсинг события...',
            success: 'Перейдите на вкладу "Ручное добавление"',
            error: 'Ошибка при добавлении события',
        });
    }, [dispatch, url]);

    return (
        <VStack gap="24px" maxW className={classNames('', {}, [className])}>
            <h2 className="text-l">Чтобы добавить событие, введи ссылку на него в поле ниже</h2>
            <HStack maxW>
                <Input
                    size="sm"
                    onChange={handleUrlChange}
                    value={url}
                    startContent={
                        <div className="pointer-events-none flex items-center">
                            <span className="text-default-400 text-small">https://</span>
                        </div>
                    }
                    type="url"
                    label="Ссылка на ресурс"
                    radius="lg"
                />
                <Button onClick={handleParseEvent} isDisabled={!url} radius="lg" size="lg">
                    Проанализировать
                </Button>
            </HStack>

            <p className="italic opacity-65 mt-5">
                * Добавляйте ссылки только на страницы с хакатонами / CTF / прочими
                киберсоревнованими
            </p>
        </VStack>
    );
};
