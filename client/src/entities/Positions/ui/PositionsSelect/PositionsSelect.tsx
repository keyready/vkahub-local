import { usePositions } from '../../api/PositionsApi';

import { classNames } from '@/shared/lib/classNames';
import { HStack } from '@/shared/ui/Stack';
import { ExtendedTag } from '@/entities/Skill';
import { AutoCompleteTags } from '@/shared/ui/AutoCompleteTags';

interface SkillsSelectProps {
    className?: string;
    selectedPositions: ExtendedTag[];
    setSelectedPositions: (positions: ExtendedTag[]) => void;
    isDisabled?: boolean;
    label?: string;
}

export const PositionsSelect = (props: SkillsSelectProps) => {
    const { className, label, selectedPositions, isDisabled, setSelectedPositions } = props;

    const { data: positions, isLoading } = usePositions(undefined, {
        refetchOnMountOrArgChange: true,
    });

    return (
        <HStack maxW className={classNames('', {}, [className])}>
            <AutoCompleteTags
                selectedItems={selectedPositions}
                setSelectedItems={setSelectedPositions}
                items={positions}
                isDisabled={isDisabled}
                label={label}
                isLoading={isLoading}
                placeholder="Выберите позиции"
            />
        </HStack>
    );
};
