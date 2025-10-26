import { useSelector } from 'react-redux';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    SharedSelection,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from '@nextui-org/react';
import { RiCheckLine, RiCloseLine, RiMailAddLine, RiMenuFill, RiRfidLine } from '@remixicon/react';

import { Proposal, ProposalType } from '../../model/types/Proposal';
import { approveProposal } from '../../model/service/approveProposal';
import { cancelProposal } from '../../model/service/cancelProposal';
import { useProposals } from '../../api/getProposalsApi';

import classes from './ProposalsList.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { HStack, VStack } from '@/shared/ui/Stack';
import { getUserData, getUserDataService } from '@/entities/User';
import { fetchTeam, getTeamData } from '@/entities/Team';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { AppLink } from '@/shared/ui/AppLink';
import { RoutePath } from '@/shared/config/routeConfig';
import { useParams } from '@/shared/lib/hooks/useParams';
import { toastDispatch } from '@/widgets/Toaster';

interface ProposalsListProps {
    className?: string;
}

export const ProposalsList = (props: ProposalsListProps) => {
    const { className } = props;

    const [selectedProposalType, setSelectedProposalType] = useState<ProposalType>('invite');

    const {
        data: proposals,
        isLoading: isProposalsLoading,
        isFetching: isProposalsFetching,
        refetch,
    } = useProposals(selectedProposalType);

    const user = useSelector(getUserData);
    const team = useSelector(getTeamData);

    const dispatch = useAppDispatch();
    const { setParams, getParamValue } = useParams();

    useEffect(() => {
        const urlProposalType = getParamValue('proposalType');
        if (urlProposalType) {
            setSelectedProposalType(urlProposalType as ProposalType);
        }
    }, [getParamValue]);

    useEffect(() => {
        if (user?.teamId) {
            dispatch(fetchTeam(user.teamId.toString()));
        }
    }, [dispatch, user?.teamId]);

    const renderProposalType = useMemo(
        () => (selectedProposalType === 'invite' ? 'приглашения' : 'запросы на вступления'),
        [selectedProposalType],
    );

    const handleChangeSelectedType = useCallback(
        (key: SharedSelection) => {
            setSelectedProposalType(key.anchorKey as ProposalType);

            setParams({
                tab: 'proposals',
                proposalType: key.anchorKey as string,
            });
        },
        [setParams],
    );

    const handleApproveInvite = useCallback(
        async (proposalId: number) => {
            await toastDispatch(dispatch(approveProposal(proposalId)), {
                success: 'Заявка принята',
                loading: 'Отправляем запрос...',
                error: 'Не получилось принять приглашение',
            });

            await refetch();
            await dispatch(getUserDataService());
        },
        [dispatch, refetch],
    );

    const handleCancelInvite = useCallback(
        async (proposalId: number) => {
            await toastDispatch(dispatch(cancelProposal(proposalId)), {
                success: 'Заявка отклонена',
                loading: 'Отправляем запрос...',
                error: 'Не получилось отклонить приглашение',
            });

            await refetch();
            await dispatch(getUserDataService());
        },
        [dispatch, refetch],
    );

    const renderProposalsItems = useMemo<Proposal[]>(() => {
        if (!proposals?.length) return [];

        return proposals
            .filter((proposal) => proposal.type === selectedProposalType)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [proposals, selectedProposalType]);

    const renderTeamLink = useCallback((teamTitle?: string, teamId?: number) => {
        if (!teamId || !teamTitle) {
            return '';
        }

        const teamTitleLink = teamTitle
            .toLowerCase()
            .replace(/[^a-zа-яё0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        return `${RoutePath.team + teamId}/${teamTitleLink}`;
    }, []);

    const renderCreatedDate = useCallback(
        (proposal: Proposal) =>
            new Date(proposal.createdAt).toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }),
        [],
    );

    return (
        <VStack maxW className={classNames(classes.ProposalsList, {}, [className])}>
            <HStack>
                <h1>Отображать</h1>
                <Dropdown>
                    <DropdownTrigger>
                        <Button>{renderProposalType}</Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        selectionMode="single"
                        onSelectionChange={handleChangeSelectedType}
                    >
                        <DropdownItem
                            description={
                                <p className="italic">Команды, в которые Вас пригласили</p>
                            }
                            className="text-main"
                            key="invite"
                            startContent={<RiMailAddLine size={22} className="text-primary" />}
                        >
                            Приглашения
                        </DropdownItem>
                        <DropdownItem
                            description={
                                team?.captain_id === user?.id ? (
                                    <p className="italic">Запросы на вступление в команду</p>
                                ) : (
                                    <p className="italic">Доступно только капитану команды</p>
                                )
                            }
                            isDisabled={team?.captain_id !== user?.id}
                            className="text-main"
                            key="request"
                            startContent={<RiRfidLine size={22} className="text-primary" />}
                        >
                            Запросы на вступление
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </HStack>

            <Table
                isHeaderSticky
                classNames={{
                    base: 'max-h-[340px] overflow-scroll',
                    wrapper: 'bg-card-bg p-0',
                    th: 'bg-grad-end dark:bg-main-bg',
                }}
                aria-label="Заявки"
                removeWrapper
            >
                <TableHeader>
                    <TableColumn>От кого</TableColumn>
                    <TableColumn>В какую команду</TableColumn>
                    <TableColumn>Сообщение</TableColumn>
                    <TableColumn>Когда создано</TableColumn>
                    <TableColumn>Действие</TableColumn>
                </TableHeader>
                <TableBody
                    isLoading={isProposalsLoading || isProposalsFetching}
                    loadingContent={<Spinner content="Загружаем..." />}
                    emptyContent={
                        selectedProposalType === 'invite'
                            ? 'У вас пока нет приглашений'
                            : 'Заявок на вступление в команду нет'
                    }
                    items={renderProposalsItems}
                >
                    {(proposal) => (
                        <TableRow key={proposal.id}>
                            <TableCell>{proposal.memberName}</TableCell>
                            <TableCell>
                                <AppLink
                                    target="_blank"
                                    className="!text-primary after:bg-white"
                                    to={renderTeamLink(proposal.teamTitle, proposal.teamId)}
                                >
                                    {proposal.teamTitle}
                                </AppLink>
                            </TableCell>
                            <TableCell>{proposal.message}</TableCell>
                            <TableCell>{renderCreatedDate(proposal)}</TableCell>
                            <TableCell>
                                <Dropdown>
                                    <DropdownTrigger>
                                        <Button>
                                            <RiMenuFill size={18} />
                                        </Button>
                                    </DropdownTrigger>

                                    <DropdownMenu>
                                        <DropdownItem
                                            onClick={() => handleApproveInvite(proposal.id)}
                                            startContent={<RiCheckLine />}
                                            className="text-green-400"
                                            key="approve"
                                        >
                                            Принять
                                        </DropdownItem>
                                        <DropdownItem
                                            onClick={() => handleCancelInvite(proposal.id)}
                                            startContent={<RiCloseLine />}
                                            className="text-red-400"
                                            key="cancel"
                                        >
                                            Отклонить
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </VStack>
    );
};
