import classes from './ProposalsBlock.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { VStack } from '@/shared/ui/Stack';
import { ProposalsList } from '@/entities/Proposal';

interface ProposalsBlockProps {
    className?: string;
}

export const ProposalsBlock = (props: ProposalsBlockProps) => {
    const { className } = props;

    return (
        <VStack gap="24px" maxW className={classNames(classes.ProposalsBlock, {}, [className])}>
            <VStack maxW gap="0px">
                <h1 className="text-primary text-l font-bold">Ваши заявки</h1>
                <p className="italic">
                    Здесь отображаются все ваши заявки на вступление или приглашение в команду. Вы
                    можете просмотреть их, подтвердить или отклонить.
                </p>
            </VStack>

            <ProposalsList />
        </VStack>
    );
};
