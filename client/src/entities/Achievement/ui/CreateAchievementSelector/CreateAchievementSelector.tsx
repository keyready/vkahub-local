import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    SharedSelection,
} from '@nextui-org/react';
import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import { createAchievement } from '../../model/services/createAchievement';
import { ResultType } from '../../model/types/Achievement';
import { getAchievementIsLoading } from '../../model/selectors/AchievementSelectors';

import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { toastDispatch } from '@/widgets/Toaster';
import { useEvents } from '@/entities/Event/api/fetchEventsApi';
import { HStack } from '@/shared/ui/Stack';

interface CreateAchievementSelectorProps {
    className?: string;
    eventId: number;
    teamId: number | undefined;
}

export const CreateAchievementSelector = (props: CreateAchievementSelectorProps) => {
    const { className, eventId, teamId } = props;

    const dispatch = useAppDispatch();

    const { refetch } = useEvents('old');

    const isAchievementsCreating = useSelector(getAchievementIsLoading);

    const [selectedKeys, setSelectedKeys] = useState<ResultType | undefined>();

    const renderResultButtonText = useMemo(() => {
        if (!selectedKeys) {
            return 'Выберите результат';
        }

        switch (selectedKeys) {
            case 'first':
                return 'Победитель';
            case 'second':
                return 'Второе место';
            case 'third':
                return 'Третье место';
            default:
                return 'Участник';
        }
    }, [selectedKeys]);

    const handleSelectionChange = useCallback(async (keys: SharedSelection) => {
        // @ts-ignore
        setSelectedKeys(keys.currentKey);
    }, []);

    const handleSaveAchievement = useCallback(async () => {
        if (!teamId) {
            toast.error('Не получилось получить данные команды');
            return;
        }

        const result = await toastDispatch(
            dispatch(
                createAchievement({
                    eventId,
                    result: selectedKeys as ResultType,
                    teamId,
                }),
            ),
            {
                loading: 'Записываем данные...',
                success: 'Данные записаны',
                error: 'Ошибка записи данных',
            },
        );

        if (result.meta.requestStatus === 'fulfilled') {
            await refetch();
        }
    }, [dispatch, eventId, refetch, selectedKeys, teamId]);

    return (
        <HStack gap="12px">
            <Dropdown>
                <DropdownTrigger>
                    <Button
                        color="warning"
                        isDisabled={isAchievementsCreating}
                        size="sm"
                        className="font-bold text-wrap"
                    >
                        {renderResultButtonText}
                    </Button>
                </DropdownTrigger>
                <DropdownMenu
                    selectionMode="single"
                    selectedKeys={selectedKeys}
                    onSelectionChange={handleSelectionChange}
                >
                    <DropdownItem className="text-primary" key="first">
                        Победитель
                    </DropdownItem>
                    <DropdownItem className="text-primary" key="second">
                        Второе место
                    </DropdownItem>
                    <DropdownItem className="text-primary" key="third">
                        Третье место
                    </DropdownItem>
                    <DropdownItem className="text-primary" key="participant">
                        Участник
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
            <Button
                className="text-wrap"
                isDisabled={isAchievementsCreating || !selectedKeys}
                type="button"
                size="sm"
                color="success"
                onClick={handleSaveAchievement}
            >
                Сохранить результат
            </Button>
        </HStack>
    );
};
