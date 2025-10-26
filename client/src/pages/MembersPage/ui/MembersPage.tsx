import { memo } from 'react';
import { BreadcrumbItem, Breadcrumbs } from '@nextui-org/react';

import classes from './MembersPage.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { Page } from '@/widgets/Page';
import { UsersFiltersBlock, UsersList } from '@/entities/User';
import { HStack } from '@/shared/ui/Stack';
import { Helmet } from '@/widgets/Helmet';
import { RoutePath } from '@/shared/config/routeConfig';
import { DynamicModuleLoader } from '@/shared/lib/DynamicModuleLoader';
import { TeamReducer } from '@/entities/Team';
import { useWindowWidth } from '@/shared/lib/hooks/useWindowWidth';

interface MembersPageProps {
    className?: string;
}

const MembersPage = memo((props: MembersPageProps) => {
    const { className } = props;

    const { isMobile } = useWindowWidth();

    return (
        <DynamicModuleLoader reducers={{ team: TeamReducer }}>
            <Page className={classNames(classes.MembersPage, {}, [className])}>
                <Helmet
                    title="Участники | Научный потенциал"
                    description="Полный список участников научных проектов. Отследите прогресс и достижения каждого члена научного сообщества."
                />

                <Breadcrumbs
                    itemClasses={{
                        item: 'data-[current=true]:text-accent',
                    }}
                >
                    <BreadcrumbItem href={RoutePath.main}>Главная</BreadcrumbItem>
                    <BreadcrumbItem href={RoutePath.members}>Все участники</BreadcrumbItem>
                </Breadcrumbs>

                <h1 className="mt-2 mb-4 w-full text-center text-2xl font-bold">Участники</h1>

                <HStack maxW align="start" gap="24px" className="overflow-y-auto relative">
                    {!isMobile && <UsersFiltersBlock className="sticky top-0" />}
                    <UsersList />
                </HStack>
            </Page>
        </DynamicModuleLoader>
    );
});

export default MembersPage;
