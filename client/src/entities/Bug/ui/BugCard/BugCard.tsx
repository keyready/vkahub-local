import { Button, Divider, Image } from '@nextui-org/react';
import { useCallback, useState } from 'react';

import { Bug, BugStatus } from '../../model/types/Bug';
import { changeBugStatus } from '../../model/services/changeBugStatus';
import { useBugs } from '../../api/BugsApi';
import { SelectBug } from '../SelectBug/SelectBug';

import classes from './BugCard.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { HStack, VStack } from '@/shared/ui/Stack';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { toastDispatch } from '@/widgets/Toaster';

interface BugCardProps {
    className?: string;
    bugReport: Bug;
    defaultSelectedKey: string;
}

const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'webm', 'mp4'];

export const BugCard = (props: BugCardProps) => {
    const { className, bugReport, defaultSelectedKey } = props;

    const { refetch } = useBugs(defaultSelectedKey);

    const dispatch = useAppDispatch();

    const [selectedKey, setSelectedKey] = useState<string>(bugReport.status);

    const handleChangeStatusClick = useCallback(async () => {
        await toastDispatch(
            dispatch(changeBugStatus({ status: selectedKey as BugStatus, bugId: bugReport.id })),
        );
        await refetch();
    }, [refetch, bugReport.id, dispatch, selectedKey]);

    return (
        <VStack
            gap="12px"
            className={classNames('border-3 border-main-bg p-4 rounded-xl', {}, [className])}
            maxW
        >
            <HStack justify="between" maxW align="center">
                <h1 className="text-xl font-bold tracking-widest">{bugReport.author}</h1>
                <h3>{new Date(bugReport.createdAt).toLocaleDateString()}</h3>
            </HStack>

            <VStack maxW gap="0">
                <h2 className="text-sm font-bold">Описание ошибки</h2>
                <p className="text-sm italic">{bugReport.description}</p>
            </VStack>

            <Divider />

            <VStack maxW gap="0">
                <h2 className="text-sm font-bold">Дополнительная информация</h2>
                <p className="text-sm italic">{bugReport.additional}</p>
            </VStack>

            <Divider />

            <VStack maxW gap="0">
                <h2 className="text-sm font-bold">Как повторить</h2>
                <p className="text-sm italic">{bugReport.produce}</p>
            </VStack>

            <Divider />

            <VStack maxW gap="0">
                <h2 className="text-sm font-bold">Ожидаемое поведение</h2>
                <p className="text-sm italic">{bugReport.expected}</p>
            </VStack>

            {bugReport.media?.length && (
                <>
                    <Divider />
                    <VStack maxW gap="8px">
                        <h2 className="text-sm font-bold">Приложение</h2>
                        <HStack gap="8px" maxW>
                            {bugReport.media.map((media) => {
                                if (videoTypes.includes(media.split('.')[1])) {
                                    return (
                                        <video
                                            src={`https://storage.yandexcloud.net/vkahub-storage/${media}`}
                                            controls
                                            width={300}
                                            height={300}
                                        />
                                    );
                                }

                                return (
                                    <Image
                                        classNames={{
                                            wrapper: classes.imageWrapper,
                                        }}
                                        fallbackSrc="/static/fallbacks/image-fallback.webp"
                                        src={`https://storage.yandexcloud.net/vkahub-storage/${media}`}
                                        width={150}
                                        height={150}
                                    />
                                );
                            })}
                        </HStack>
                    </VStack>
                </>
            )}

            <HStack maxW className="justify-end">
                <SelectBug
                    defaultValue={bugReport.status}
                    selectedKey={selectedKey}
                    setSelectedKey={setSelectedKey}
                />
                <Button
                    isDisabled={selectedKey === bugReport.status}
                    onClick={handleChangeStatusClick}
                >
                    Изменить статус
                </Button>
            </HStack>
        </VStack>
    );
};
