import { Select, SelectItem } from '@nextui-org/react';
import { ChangeEvent, useCallback } from 'react';

import { BugStatus } from '@/entities/Bug';

interface SelectBugProps {
    defaultValue: BugStatus;
    selectedKey: string;
    setSelectedKey: (value: string) => void;
}

export const SelectBug = (props: SelectBugProps) => {
    const { defaultValue, setSelectedKey, selectedKey } = props;

    const handleSelectChange = useCallback(
        (e: ChangeEvent<HTMLSelectElement>) => {
            setSelectedKey(e.target.value);
        },
        [setSelectedKey],
    );

    const renderBugStatusText = useCallback((status: BugStatus) => {
        switch (status) {
            case BugStatus.OPENED:
                return 'Новый';
            case BugStatus.CLOSED:
                return 'Решен';
            default:
                return 'В процессе';
        }
    }, []);

    const renderItemColor = useCallback((status: BugStatus) => {
        switch (status) {
            case BugStatus.OPENED:
                return 'danger';
            case BugStatus.CLOSED:
                return 'success';
            default:
                return 'warning';
        }
    }, []);

    return (
        <Select
            className="w-1/4"
            aria-label="Выберите статус"
            color={renderItemColor(selectedKey as BugStatus)}
            onChange={handleSelectChange}
            defaultSelectedKeys={new Set([defaultValue])}
        >
            <SelectItem
                aria-label={BugStatus.OPENED}
                classNames={{
                    title: 'text-primary',
                }}
                key={BugStatus.OPENED}
                value={BugStatus.OPENED}
            >
                {renderBugStatusText(BugStatus.OPENED)}
            </SelectItem>
            <SelectItem
                aria-label={BugStatus.PROGRESS}
                classNames={{
                    title: 'text-primary',
                }}
                key={BugStatus.PROGRESS}
                value={BugStatus.PROGRESS}
            >
                {renderBugStatusText(BugStatus.PROGRESS)}
            </SelectItem>
            <SelectItem
                aria-label={BugStatus.CLOSED}
                classNames={{
                    title: 'text-primary',
                }}
                key={BugStatus.CLOSED}
                value={BugStatus.CLOSED}
            >
                {renderBugStatusText(BugStatus.CLOSED)}
            </SelectItem>
        </Select>
    );
};
