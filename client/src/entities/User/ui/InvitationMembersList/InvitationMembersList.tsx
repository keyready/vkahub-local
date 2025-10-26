import {
    Button,
    Modal,
    ModalContent,
    Selection,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Textarea,
} from '@nextui-org/react';
import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import { getUserData } from '../../model/selectors/UserSelectors';
import { useUsers } from '../../api/fetchAllUsersApi';

import classes from './InvitationMembersList.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { VStack } from '@/shared/ui/Stack';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { toastDispatch } from '@/widgets/Toaster';
import { createProposal, getProposalIsLoading } from '@/entities/Proposal';
import { getTeamData } from '@/entities/Team';

interface InvitationMembersListProps {
    className?: string;
    isOpened: boolean;
    setIsOpened: (state: boolean) => void;
}

export const InvitationMembersList = (props: InvitationMembersListProps) => {
    const { className, isOpened, setIsOpened } = props;

    const { data: users, isLoading } = useUsers(
        {},
        {
            refetchOnMountOrArgChange: true,
        },
    );

    const userData = useSelector(getUserData);
    const teamData = useSelector(getTeamData);
    const isProposalCreating = useSelector(getProposalIsLoading);

    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [invitationMessage, setInvitationMessage] = useState<string>(
        'Ваши навыки нас заинтересовали, приглашаем Вас вступить в нашу команду',
    );

    const dispatch = useAppDispatch();

    const handleCloseModal = useCallback(() => {
        setIsOpened(false);
    }, [setIsOpened]);

    const handleSelectionChange = useCallback((selection: Selection) => {
        setSelectedKeys(Array.from(selection, (range) => range.toString()));
    }, []);

    const handleInviteMembers = useCallback(async () => {
        if (!userData?.teamId) {
            toast.error('Вы не состоите в команде');
            return;
        }

        const result = await toastDispatch(
            dispatch(
                createProposal({
                    teamId: userData.teamId,
                    usersId: selectedKeys.map((key) => Number(key)),
                    type: 'invite',
                    message: invitationMessage,
                }),
            ),
            {
                loading: 'Рассылаем приглашения...',
                success: 'Приглашения разосланы',
                error: 'Ошибка при приглашении пользователей',
            },
        );

        if (result.meta.requestStatus === 'fulfilled') {
            setIsOpened(false);
        }
    }, [setIsOpened, dispatch, invitationMessage, selectedKeys, userData?.teamId]);

    return (
        <Modal size="3xl" backdrop="blur" isOpen={isOpened} onClose={handleCloseModal}>
            <ModalContent className="p-4 bg-grad-end dark:bg-card-bg">
                <VStack
                    gap="24px"
                    maxW
                    className={classNames(classes.InvitationMembersList, {}, [className])}
                >
                    <h1 className="text-l text-primary">Выберите пользователей из списка</h1>

                    <Table
                        selectionMode="multiple"
                        selectedKeys={selectedKeys}
                        onSelectionChange={handleSelectionChange}
                        classNames={{
                            td: 'text-primary cursor-pointer',
                            wrapper: 'p-0',
                        }}
                    >
                        <TableHeader>
                            <TableColumn>ФИО</TableColumn>
                            <TableColumn>Имя пользователя</TableColumn>
                        </TableHeader>
                        <TableBody
                            isLoading={isLoading}
                            emptyContent="Нет пользователей для приглашения"
                            items={
                                users?.length
                                    ? users?.filter(
                                          (user) =>
                                              user.id !== userData?.id &&
                                              user.teamId !== teamData?.id,
                                      )
                                    : []
                            }
                        >
                            {(user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        {user.lastname} {user.firstname?.slice(0, 1)}.{' '}
                                        {user.middlename?.slice(0, 1)}.
                                    </TableCell>
                                    <TableCell>{user.username}</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <Textarea
                        classNames={{
                            inputWrapper: 'h-auto',
                        }}
                        value={invitationMessage}
                        onChange={(event) => setInvitationMessage(event.target.value)}
                        minRows={4}
                        label="Напишите пригласительное письмо, например:"
                    />

                    <Button
                        onClick={handleInviteMembers}
                        className="self-end"
                        isDisabled={!selectedKeys?.length || isProposalCreating}
                        size="sm"
                    >
                        Пригласить
                    </Button>
                </VStack>
            </ModalContent>
        </Modal>
    );
};
