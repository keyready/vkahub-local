export type ProposalType = 'request' | 'invite';

export interface Proposal {
    id: number;
    type: ProposalType;
    teamId: number;
    teamTitle: string;
    ownerId: number;
    memberName: string;
    message?: string;
    createdAt: Date;
}
