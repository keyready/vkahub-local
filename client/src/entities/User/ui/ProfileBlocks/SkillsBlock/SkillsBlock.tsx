import { Button } from '@nextui-org/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import { changeUserProfile } from '../../../model/services/profileServices/changeUserProfile';
import { getUserDataService } from '../../../model/services/profileServices/getUserData';
import {
    getIsProfileChanging,
    getUserData,
    getUserIsLoading,
} from '../../../model/selectors/UserSelectors';

import classes from './SkillsBlock.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { VStack } from '@/shared/ui/Stack';
import { ExtendedTag, SkillsSelect } from '@/entities/Skill';
import { toastDispatch } from '@/widgets/Toaster';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { PositionsSelect } from '@/entities/Positions';
import { createSkill } from '@/entities/Skill/model/service/createSkill';
import { createPosition } from '@/entities/Positions/model/service/createPosition';

interface SkillsBlockProps {
    className?: string;
}

export const SkillsBlock = (props: SkillsBlockProps) => {
    const { className } = props;

    const dispatch = useAppDispatch();

    const userData = useSelector(getUserData);
    const isUserLoading = useSelector(getUserIsLoading);
    const isUserChanging = useSelector(getIsProfileChanging);

    const [selectedSkills, setSelectedSkills] = useState<ExtendedTag[]>([]);
    const [selectedPositions, setSelectedPositions] = useState<ExtendedTag[]>([]);

    const isButtonDisabled = useMemo(
        () => isUserLoading || isUserChanging,
        [isUserChanging, isUserLoading],
    );

    useEffect(() => {
        if (userData?.skills?.length) {
            setSelectedSkills(userData.skills.map((skill) => ({ label: skill, value: skill })));
        }
        if (userData?.positions?.length) {
            setSelectedPositions(
                userData.positions.map((position) => ({ label: position, value: position })),
            );
        }
    }, [setSelectedSkills, userData?.positions, userData?.skills]);

    const handleSaveSkills = useCallback(async () => {
        const newSkills = selectedSkills.filter((skill) => skill.new);
        const newPositions = selectedPositions.filter((position) => position.new);

        if (newSkills.length) {
            toast(`Будет создано новых навыков: ${newSkills.length}`);
            for (const skill of newSkills) {
                await dispatch(createSkill(skill.label));
            }
        }
        if (newPositions.length) {
            toast(`Будет создано новых позиций: ${newPositions.length}`);
            for (const position of newPositions) {
                await dispatch(createPosition(position.label));
            }
        }

        await toastDispatch(
            dispatch(
                changeUserProfile({
                    ...userData,
                    skills: Array.from(selectedSkills).map((skill) => skill.label.toString()),
                    positions: Array.from(selectedPositions).map((position) =>
                        position.label.toString(),
                    ),
                }),
            ),
            {
                loading: 'Сохраняем резюме...',
                success: 'Данные успешно сохранены!',
                error: 'Произошла ошибка...(',
            },
        );

        await dispatch(getUserDataService());
    }, [dispatch, selectedPositions, selectedSkills, userData]);

    return (
        <VStack gap="24px" maxW className={classNames(classes.SkillsBlock, {}, [className])}>
            <VStack maxW gap="0px">
                <h1 className="text-primary text-l font-bold">Ваши навыки</h1>
                <p className="italic">
                    В этом разделе Вы можете указать профиль, на котором Вы специализируетесь,
                    языки, фреймворки, на которых пишете, и ищите ли Вы команду
                </p>
            </VStack>

            <VStack maxW gap="12px">
                <PositionsSelect
                    label="Позиции"
                    isDisabled={isButtonDisabled}
                    selectedPositions={selectedPositions}
                    setSelectedPositions={setSelectedPositions}
                />
                <SkillsSelect
                    label="Навыки"
                    isDisabled={isButtonDisabled}
                    selectedSkills={selectedSkills}
                    setSelectedSkills={setSelectedSkills}
                />

                <Button
                    className="self-end"
                    color="success"
                    isDisabled={isButtonDisabled}
                    onClick={handleSaveSkills}
                >
                    Сохранить
                </Button>
            </VStack>
        </VStack>
    );
};
