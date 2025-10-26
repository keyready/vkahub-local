import { useCallback } from 'react';
import {
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from '@nextui-org/react';

import { useMemberAchievements } from '../../api/achievementsApi';
import { AchievementReducer } from '../../model/slice/AchievementSlice';

import { ResultType } from '@/entities/Achievement/model/types/Achievement';
import { DynamicModuleLoader } from '@/shared/lib/DynamicModuleLoader';
import { VStack } from '@/shared/ui/Stack';
import { Skeleton } from '@/shared/ui/Skeleton';

interface MemberAchievementsTableProps {
    className?: string;
    userId?: string;
    name?: string;
}

const columns = [
    { key: 'eventName', label: 'Название мероприятия' },
    { key: 'teamTitle', label: 'Команда' },
    { key: 'result', label: 'Результат' },
];

export const MemberAchievementsTable = (props: MemberAchievementsTableProps) => {
    const { className, userId, name } = props;

    const { data: achievements, isLoading: isAchievementsLoading } = useMemberAchievements(userId);

    const renderAchievementResult = useCallback((result: ResultType) => {
        switch (result) {
            case 'first':
                return 'Победитель';
            case 'second':
                return 'Второе место';
            case 'third':
                return 'Третье место';
            default:
                return 'Участник';
        }
    }, []);

    if (isAchievementsLoading) {
        return (
            <DynamicModuleLoader reducers={{ achievement: AchievementReducer }}>
                <VStack maxW className="p-4 bg-card-bg">
                    {new Array(5).fill(0).map((_, index) => (
                        <Skeleton width="100%" height={40} key={index} />
                    ))}
                </VStack>
            </DynamicModuleLoader>
        );
    }

    if ((!achievements?.length && !isAchievementsLoading) || !userId) {
        return (
            <DynamicModuleLoader reducers={{ achievement: AchievementReducer }}>
                <div className="bg-card-bg p-4 rounded-xl w-full">
                    <h1 className="text-m opacity-30">
                        {name} не принимал участия в соревнованиях
                    </h1>
                </div>
            </DynamicModuleLoader>
        );
    }

    return (
        <DynamicModuleLoader reducers={{ achievement: AchievementReducer }}>
            <Table
                classNames={{
                    wrapper: 'bg-card-bg h-full',
                    th: 'bg-main-bg',
                }}
                className="h-full"
                aria-label="Достижения участника"
                topContent={<p className="opacity-30 text-m">Достижения участника</p>}
            >
                <TableHeader columns={columns}>
                    {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                </TableHeader>
                <TableBody
                    isLoading={isAchievementsLoading}
                    loadingContent={<Spinner content="Загружаем..." />}
                    emptyContent="Участник не принимал участия в соревнованиях"
                    items={achievements}
                >
                    {(achievement) => (
                        <TableRow key={achievement.id}>
                            <TableCell>{achievement.eventName}</TableCell>
                            <TableCell>{achievement.teamTitle}</TableCell>
                            <TableCell>{renderAchievementResult(achievement.result)}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </DynamicModuleLoader>
    );
};
