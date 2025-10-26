import { useEffect, useState } from 'react';

import { useProfileAchievements } from '../../api/ProfileAchievementApi';
import { AchievementPreviewModal } from '../AchievementPreviewModal/AchievementPreviewModal';

import { Skeleton } from '@/shared/ui/Skeleton';
import { HStack } from '@/shared/ui/Stack';
import { useWindowWidth } from '@/shared/lib/hooks/useWindowWidth';

interface AchievementsPreviewListProps {
    username: string;
}

export const AchievementsPreviewList = (props: AchievementsPreviewListProps) => {
    const { username } = props;

    const { data: profileAchievements, isLoading: isProfileAchievementsLoading } =
        useProfileAchievements(username);

    const { isMobile } = useWindowWidth();

    const [maxRarity, setMaxRarity] = useState<number>(0);
    const [minRarity, setMinRarity] = useState<number>(0);

    useEffect(() => {
        if (profileAchievements?.length) {
            setMaxRarity(Math.max(...profileAchievements.map((achievement) => achievement.rarity)));
            setMinRarity(Math.min(...profileAchievements.map((achievement) => achievement.rarity)));
        }
    }, [profileAchievements]);

    return (
        <HStack maxW className="flex-wrap" justify="center">
            {isProfileAchievementsLoading
                ? new Array(5)
                      .fill(0)
                      .map((_, index) => (
                          <Skeleton
                              rounded={999}
                              width={isMobile ? 20 : 40}
                              height={isMobile ? 20 : 40}
                              key={index}
                          />
                      ))
                : profileAchievements?.length
                ? [...profileAchievements]
                      .sort((a, b) => a.title.localeCompare(b.title))
                      ?.sort((a, b) => a.rarity - b.rarity)
                      .map((profileAchievement) => (
                          <AchievementPreviewModal
                              maxRarity={maxRarity}
                              minRarity={minRarity}
                              profileAchievement={profileAchievement}
                              key={profileAchievement.id}
                          />
                      ))
                : null}
        </HStack>
    );
};
