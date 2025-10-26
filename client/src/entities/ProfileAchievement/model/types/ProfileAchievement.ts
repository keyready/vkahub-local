export enum ProfileAchievementKeys {
    CONFIRMED = 'confirmed',
    LEADER = 'leader',
    MEMBER = 'member',
    POPULATE = 'populate',
    BAPTISM = 'baptism',
    HIKEMAN = 'hikeman',
    VICTORYBANNER = 'victoryBanner',
    MILESTONE = 'milestone',
    WILL2WIN = 'will2win',
    CHANGE = 'change',
    RECEIVER = 'receiver',
}

export enum AchievementsRarity {
    COMMON = 'common',
    UNCOMMON = 'uncommon',
    RARE = 'rare',
    LEGENDARY = 'legendary',
    ARCANE = 'arcane',
}

export interface ProfileAchievement {
    id: number;
    title: string;
    description: string;
    image: string;
    rarity: number;
}
