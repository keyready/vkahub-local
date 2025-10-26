import {
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from '@nextui-org/react';
import { useCallback } from 'react';

import { AchievementReducer } from '../../model/slice/AchievementSlice';
import { useTeamAchievements } from '../../api/achievementsApi';
import { ResultType } from '../../model/types/Achievement';

import { DynamicModuleLoader } from '@/shared/lib/DynamicModuleLoader';
import { VStack } from '@/shared/ui/Stack';
import { Skeleton } from '@/shared/ui/Skeleton';
import { EventType } from '@/entities/Event';

const columns = [
    { key: 'eventType', label: 'Тип мероприятия' },
    { key: 'eventName', label: 'Название мероприятия' },
    { key: 'trackId', label: 'Трек (при наличии)' },
    { key: 'result', label: 'Результат' },
];

interface AchievementsTableProps {
    className?: string;
    teamId: number;
}

export const AchievementsTable = (props: AchievementsTableProps) => {
    const { className, teamId } = props;

    const { data: achievements, isLoading: isAchievementsLoading } = useTeamAchievements(teamId);

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

    const renderAchievementEventType = useCallback((type: EventType) => {
        switch (type) {
            case 'hack':
                return 'Хакатон';
            case 'ctf':
                return 'CTF';
            default:
                return 'Другое';
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

    if (!achievements?.length && !isAchievementsLoading) {
        return (
            <DynamicModuleLoader reducers={{ achievement: AchievementReducer }}>
                <div className="bg-card-bg p-4 rounded-xl w-full">
                    <h1 className="text-m opacity-30">
                        Команда не принимала участия в соревнованиях
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
                aria-label="Достижения команды"
                topContent={<p className="opacity-30 text-m">Достижения команды</p>}
            >
                <TableHeader columns={columns}>
                    {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                </TableHeader>
                <TableBody
                    isLoading={isAchievementsLoading}
                    loadingContent={<Spinner content="Загружаем..." />}
                    emptyContent="Команда не принимала участия в соревнованиях"
                    items={achievements}
                >
                    {(achievement) => (
                        <TableRow key={achievement.id}>
                            <TableCell>
                                {renderAchievementEventType(achievement.eventType)}
                            </TableCell>
                            <TableCell>{achievement.eventName}</TableCell>
                            <TableCell>—</TableCell>
                            <TableCell>{renderAchievementResult(achievement.result)}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </DynamicModuleLoader>
    );
};
