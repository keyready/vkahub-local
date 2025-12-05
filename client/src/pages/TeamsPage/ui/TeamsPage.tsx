import { memo, useState } from 'react';
import { BreadcrumbItem, Breadcrumbs } from '@nextui-org/react';

import classes from './TeamsPage.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { Page } from '@/widgets/Page';
import { DisplayVariant, TeamReducer, TeamsFiltersBlock, TeamsList } from '@/entities/Team';
import { HStack } from '@/shared/ui/Stack';
import { Helmet } from '@/widgets/Helmet';
import { DynamicModuleLoader } from '@/shared/lib/DynamicModuleLoader';
import { RoutePath } from '@/shared/config/routeConfig';

interface TeamsPageProps {
    className?: string;
}

const TeamsPage = memo((props: TeamsPageProps) => {
    const { className } = props;

    const [selectedDisplay, setSelectedDisplay] = useState<DisplayVariant>('detailed');

    return (
        <DynamicModuleLoader removeAfterUnmount={false} reducers={{ team: TeamReducer }}>
            <Page className={classNames(classes.TeamsPage, {}, [className])}>
                <Helmet
                    title="Команды | Научное сообщество"
                    description="Обзор всех действующих команд в системе учета научной деятельности. Просмотрите список команд и их достижения."
                />

                <div className="flex relative items-center">
                    <Breadcrumbs
                        className="absolute top-1/2 -translate-y-1/2 left-0"
                        itemClasses={{
                            item: 'data-[current=true]:text-accent',
                        }}
                    >
                        <BreadcrumbItem href={RoutePath.main}>Главная</BreadcrumbItem>
                        <BreadcrumbItem href={RoutePath.teams}>Все команды</BreadcrumbItem>
                    </Breadcrumbs>

                    <h1 className="mt-2 w-full text-center text-2xl font-bold">Команды</h1>
                </div>

                <HStack
                    gap="24px"
                    maxH
                    maxW
                    flexGrow
                    align="start"
                    className="overflow-y-auto relative"
                >
                    <TeamsFiltersBlock
                        selectedDisplay={selectedDisplay}
                        setSelectedDisplay={setSelectedDisplay}
                    />
                    <TeamsList displayVariant={selectedDisplay} />
                </HStack>
            </Page>
        </DynamicModuleLoader>
    );
});

export default TeamsPage;
