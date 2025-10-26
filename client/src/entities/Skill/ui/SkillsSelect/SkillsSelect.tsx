import { TagSelected } from 'react-tag-autocomplete';

import { useSkills } from '../../api/SkillApi';

import { classNames } from '@/shared/lib/classNames';
import { HStack } from '@/shared/ui/Stack';
import { AutoCompleteTags } from '@/shared/ui/AutoCompleteTags';

export type ExtendedTag = TagSelected & { new?: boolean; author?: string };

interface SkillsSelectProps {
    className?: string;
    selectedSkills: ExtendedTag[];
    setSelectedSkills: (skills: ExtendedTag[]) => void;
    isDisabled?: boolean;
    label?: string;
}

export const SkillsSelect = (props: SkillsSelectProps) => {
    const { className, label, setSelectedSkills, selectedSkills, isDisabled } = props;

    const { data: skills, isLoading } = useSkills(undefined, {
        refetchOnMountOrArgChange: true,
    });

    return (
        <HStack maxW className={classNames('', {}, [className])}>
            <AutoCompleteTags
                selectedItems={selectedSkills}
                setSelectedItems={setSelectedSkills}
                label={label}
                isDisabled={isDisabled}
                isLoading={isLoading}
                placeholder="Выберите навыки"
                items={skills}
            />
        </HStack>
    );
};
