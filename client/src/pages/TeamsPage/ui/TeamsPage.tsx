import { memo, useState } from 'react';
import { BreadcrumbItem, Breadcrumbs } from '@nextui-org/react';

import classes from './TeamsPage.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { Page } from '@/widgets/Page';
import {
    DisplayVariant,
    TeamReducer,
    TeamsDisplaySelector,
    TeamsFiltersBlock,
    TeamsList,
} from '@/entities/Team';
import { HStack } from '@/shared/ui/Stack';
import { Helmet } from '@/widgets/Helmet';
import { DynamicModuleLoader } from '@/shared/lib/DynamicModuleLoader';
import { RoutePath } from '@/shared/config/routeConfig';
import { useWindowWidth } from '@/shared/lib/hooks/useWindowWidth';

interface TeamsPageProps {
    className?: string;
}

const TeamsPage = memo((props: TeamsPageProps) => {
    const { className } = props;

    const { isMobile, width } = useWindowWidth();

    const [selectedDisplay, setSelectedDisplay] = useState<DisplayVariant>('detailed');

    return (
        <DynamicModuleLoader removeAfterUnmount={false} reducers={{ team: TeamReducer }}>
            <Page className={classNames(classes.TeamsPage, {}, [className])}>
                <Breadcrumbs
                    itemClasses={{
                        item: 'data-[current=true]:text-accent',
                    }}
                >
                    <BreadcrumbItem href={RoutePath.main}>Главная</BreadcrumbItem>
                    <BreadcrumbItem href={RoutePath.teams}>Все команды</BreadcrumbItem>
                </Breadcrumbs>

                <Helmet
                    title="Команды | Научное сообщество"
                    description="Обзор всех действующих команд в системе учета научной деятельности. Просмотрите список команд и их достижения."
                />

                <h1 className="mt-2 w-full text-center text-2xl font-bold">Команды</h1>

                {!isMobile && (
                    <TeamsDisplaySelector
                        selectedDisplay={selectedDisplay}
                        setSelectedDisplay={setSelectedDisplay}
                    />
                )}

                <HStack
                    gap="24px"
                    maxH
                    maxW
                    flexGrow
                    align="start"
                    className="overflow-y-auto relative"
                >
                    {!isMobile && <TeamsFiltersBlock />}
                    <TeamsList displayVariant={selectedDisplay} />
                </HStack>
            </Page>
        </DynamicModuleLoader>
    );
});

export default TeamsPage;
