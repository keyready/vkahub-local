import { Image, Modal, ModalContent, ModalHeader, Tooltip } from '@nextui-org/react';
import { useMemo, useState } from 'react';

import { AchievementsRarity, ProfileAchievement } from '../../model/types/ProfileAchievement';

import classes from './AchievementPreviewModal.module.scss';

import { HStack } from '@/shared/ui/Stack';

interface AchievementPreviewModalProps {
    profileAchievement: ProfileAchievement;
    maxRarity: number;
    minRarity: number;
}

export const AchievementPreviewModal = (props: AchievementPreviewModalProps) => {
    const { profileAchievement, minRarity, maxRarity } = props;

    const [isModalOpened, setIsModalOpened] = useState<boolean>(false);
    const [localRarity, setLocalRarity] = useState<AchievementsRarity>(AchievementsRarity.COMMON);

    const renderRarityText = useMemo(() => {
        switch (localRarity) {
            case AchievementsRarity.COMMON:
                return 'Обычное';
            case AchievementsRarity.UNCOMMON:
                return 'Необычное';
            case AchievementsRarity.RARE:
                return 'Редкое';
            case AchievementsRarity.LEGENDARY:
                return 'Легендарный';
            default:
                return 'Мистическое';
        }
    }, [localRarity]);

    const calculateRarity = useMemo(() => {
        const normalizedRarity = (profileAchievement.rarity - minRarity) / (maxRarity - minRarity);
        const rarityScore = normalizedRarity * 5;

        if (rarityScore < 1) {
            setLocalRarity(AchievementsRarity.ARCANE);
            return 'bg-gradient-to-br from-amber-800 to-accent';
        }
        if (rarityScore < 2) {
            setLocalRarity(AchievementsRarity.LEGENDARY);
            return 'bg-gradient-to-br from-purple-600 to-pink-500';
        }
        if (rarityScore < 3) {
            setLocalRarity(AchievementsRarity.RARE);
            return 'bg-gradient-to-br from-blue-800 to-indigo-600';
        }
        if (rarityScore < 4) {
            setLocalRarity(AchievementsRarity.UNCOMMON);
            return 'bg-gradient-to-br from-gray-500 to-gray-400';
        }
        setLocalRarity(AchievementsRarity.COMMON);
        return 'bg-gradient-to-br from-gray-400 to-gray-300';
    }, [maxRarity, minRarity, profileAchievement.rarity]);

    return (
        <>
            <Tooltip
                classNames={{
                    content: 'dark:bg-primary',
                    base: 'dark:before:bg-primary',
                }}
                content={profileAchievement.title}
                key={profileAchievement.id}
                showArrow
            >
                <Image
                    onClick={() => setIsModalOpened(true)}
                    className="cursor-pointer w-7 h-7 md:w-10 md:h-10 rounded-full hover:scale-150"
                    classNames={{ wrapper: classes.achievementImg }}
                    src={`${import.meta.env.VITE_MINIO_ENDPOINT}/achievements_bucket/${profileAchievement.image}`}
                    fallbackSrc="/static/fallbacks/team-fallback.webp"
                />
            </Tooltip>

            <Modal size="xl" isOpen={isModalOpened} onClose={() => setIsModalOpened(false)}>
                <ModalContent className={`p-5 ${calculateRarity}`}>
                    <ModalHeader>
                        <h1 className="w-full text-center text-2xl text-primary">
                            {profileAchievement.title}
                        </h1>
                    </ModalHeader>
                    <HStack className="mt-5" maxW justify="center">
                        <Image
                            className="w-96 h-96 rounded-xl"
                            classNames={{ wrapper: classes.achievementImg }}
                            src={`${import.meta.env.VITE_MINIO_ENDPOINT}/achievements_bucket/${profileAchievement.image}`}
                            fallbackSrc="/static/fallbacks/team-fallback.webp"
                        />
                    </HStack>
                    <h2 className="tracking-widest py-1 px-3 backdrop-blur z-50 text-center font-bold -translate-y-10 text-l uppercase text-primary">
                        {renderRarityText}
                    </h2>
                </ModalContent>
            </Modal>
        </>
    );
};
