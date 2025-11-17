import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import { RiDoorLine, RiLoopRightLine, RiMenuFill } from '@remixicon/react';
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

import { deleteMember } from '../../../model/services/deleteMember';

import { TextButton } from '@/shared/ui/TextButton';
import { toastDispatch } from '@/widgets/Toaster';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { transferCaptainRights } from '@/entities/Team/model/services/transferCaptainRights';
import { getUserData } from '@/entities/User';

interface MembersActionsProps {
    memberId?: string;
    teamId?: string;
}

export const MembersActions = (props: MembersActionsProps) => {
    const { memberId, teamId } = props;

    const dispatch = useAppDispatch();

    const userData = useSelector(getUserData);

    const handleTransferRightsClick = useCallback(async () => {
        if (!memberId) {
            toast.error('Не найден ID пользователя');
            return;
        }

        if (!teamId) {
            toast.error('Не найден ID команды');
            return;
        }

        if (!userData?.id) {
            toast.error('Не найден ID команды');
            return;
        }

        await toastDispatch(
            dispatch(
                transferCaptainRights({
                    memberId,
                    teamId,
                    originalCaptainId: userData.id,
                }),
            ),
            {
                loading: 'Передаем дела и должность...',
                success: 'Командование передано!',
                error: 'Заявка на передачу командования не одобрена',
            },
        );
    }, [dispatch, memberId, teamId, userData?.id]);

    const handleDeleteMemberClick = useCallback(async () => {
        if (!memberId) {
            toast.error('Не найден ID пользователя');
            return;
        }

        if (!teamId) {
            toast.error('Не найден ID команды');
            return;
        }

        await toastDispatch(
            dispatch(
                deleteMember({
                    memberId,
                    teamId,
                }),
            ),
            {
                loading: 'Прощаемся с бойцом...',
                success: 'Пользователь успешно выгнан из команды',
                error: 'Не получилось открыть дверь...',
            },
        );
    }, [dispatch, memberId, teamId]);

    return (
        <Dropdown>
            <DropdownTrigger>
                <Button variant="flat" className="p-0 min-w-0 min-h-0 h-fit">
                    <RiMenuFill size={18} />
                </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Static Actions">
                <DropdownItem
                    key="change-captain"
                    startContent={<RiLoopRightLine size={14} className="text-accent" />}
                >
                    <TextButton
                        onClick={handleTransferRightsClick}
                        className="w-full no-underline text-green-400"
                    >
                        Передать капитанство
                    </TextButton>
                </DropdownItem>
                <DropdownItem
                    key="delete"
                    startContent={<RiDoorLine size={14} className="text-red-400" />}
                >
                    <TextButton
                        onClick={handleDeleteMemberClick}
                        className="w-full no-underline text-red-400"
                    >
                        Выгнать из команды
                    </TextButton>
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    );
};
