export interface Skill {
    id: number;
    title: string;
    author?: string;
}

export interface SkillSchema {
    data?: Skill;
    isLoading: boolean;
    error?: string;
}
