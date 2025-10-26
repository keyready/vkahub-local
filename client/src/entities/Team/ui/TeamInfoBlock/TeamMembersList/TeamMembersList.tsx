import { RiUserFollowLine } from '@remixicon/react';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Team } from '../../../model/types/Team';
import { MembersActions } from '../MembersActions/MembersActions';
import { useTeamMembers } from '../../../api/fetchTeamsApi';
import { participatingRequest } from '../../../model/services/participatingRequest';

import { Skeleton } from '@/shared/ui/Skeleton';
import { HStack, VStack } from '@/shared/ui/Stack';
import { getUserData, User } from '@/entities/User';
import { toastDispatch } from '@/widgets/Toaster';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { TextButton } from '@/shared/ui/TextButton';

interface TeamMembersListProps {
    className?: string;
    team: Team;
    allowRightsTransfer?: boolean;
    onRightsTransferClick?: (memberId?: number) => void;
}

export const TeamMembersList = (props: TeamMembersListProps) => {
    const { className, allowRightsTransfer, onRightsTransferClick, team } = props;

    const { data: teamMembers, isLoading: isTeamMembersLoading } = useTeamMembers(team.id);

    const userData = useSelector(getUserData);

    const dispatch = useAppDispatch();

    const renderMemberName = useCallback((member: User) => {
        const { lastname, firstname } = member;

        const fn = firstname || '';

        return `${lastname} ${fn.slice(0, 1)}.`;
    }, []);

    const handleSendParticipatingRequest = useCallback(async () => {
        await toastDispatch(
            dispatch(
                participatingRequest({
                    teamId: team.id,
                    memberId: userData?.id,
                    message: 'Я хотел бы вступить в Вашу команду',
                }),
            ),
            {
                loading: 'Отправляем',
                success: 'Заявка отправлена',
                error: 'то-то пошло не так',
            },
        );
    }, [dispatch, team.id, userData?.id]);

    const isParticipatingRequestAvailable = useMemo(() => {
        if (!userData?.id) return false;
        return !allowRightsTransfer && !teamMembers?.map((user) => user.id).includes(userData.id);
    }, [allowRightsTransfer, teamMembers, userData?.id]);

    if (isTeamMembersLoading) {
        return (
            <VStack maxW gap="4px">
                <Skeleton width="33%" height={16} />
                <Skeleton width="33%" height={16} />
                <Skeleton width="33%" height={16} />
                <Skeleton width="33%" height={16} />
            </VStack>
        );
    }

    if (!teamMembers?.length) {
        return <p className="italic">Такого, конечно, быть не может, но участников нет</p>;
    }

    return (
        <ol className="w-full">
            {teamMembers.map((member) => (
                <li key={member.id} className="w-full flex justify-between">
                    <HStack align="center" gap="8px">
                        <RiUserFollowLine
                            className={member.id === team.captain_id ? 'text-green-400' : ''}
                            size={14}
                        />
                        <p className={member.id === team.captain_id ? 'text-green-400' : ''}>
                            {renderMemberName(member)}
                        </p>
                    </HStack>
                    {member.id === team.captain_id && <p className="text-green-400">Капитан</p>}
                    {member.id !== team.captain_id &&
                        userData?.id === team.captain_id &&
                        allowRightsTransfer && (
                            <MembersActions teamId={team?.id} memberId={member.id} />
                        )}
                </li>
            ))}
            {isParticipatingRequestAvailable && (
                <TextButton
                    className="mt-5 text-xs italic opacity-60"
                    onClick={handleSendParticipatingRequest}
                >
                    Отправить запрос на вступление
                </TextButton>
            )}
        </ol>
    );
};
