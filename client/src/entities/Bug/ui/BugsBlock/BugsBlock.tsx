import { BugsList } from '../BugsList/BugsList';

import { classNames } from '@/shared/lib/classNames';
import { VStack } from '@/shared/ui/Stack';
import { DynamicModuleLoader } from '@/shared/lib/DynamicModuleLoader';
import { BugReducer } from '@/entities/Bug';

interface BugsBlockProps {
    className?: string;
}

export const BugsBlock = (props: BugsBlockProps) => {
    const { className } = props;

    return (
        <DynamicModuleLoader reducers={{ bug: BugReducer }}>
            <VStack gap="18px" className={classNames('', {}, [className])}>
                <VStack maxW gap="0px">
                    <h1 className="text-primary text-l">Жалобы пользователей</h1>
                    <p className="italic">
                        Здесь отображаются обнаруженные пользователями ошибки и баги в работе
                        приложения.
                    </p>
                </VStack>

                <BugsList />
            </VStack>
        </DynamicModuleLoader>
    );
};
