import { Key, memo, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tab, Tabs } from '@nextui-org/react';
import queryString from 'query-string';
import { useSelector } from 'react-redux';

import classes from './FeedPage.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { Page } from '@/widgets/Page';
import { Helmet } from '@/widgets/Helmet';
import { CreateTeamForm, MyTeamPreviewBlock, TeamReducer } from '@/entities/Team';
import {
    AccountSettings,
    getUserRoles,
    PortfolioBlock,
    ProfileInfoBlock,
    SkillsBlock,
    UserRoles,
} from '@/entities/User';
import { useWindowWidth } from '@/shared/lib/hooks/useWindowWidth';
import { DynamicModuleLoader } from '@/shared/lib/DynamicModuleLoader';
import { ProposalsBlock } from '@/entities/Proposal';

interface FeedPageProps {
    className?: string;
}

const FeedPage = memo((props: FeedPageProps) => {
    const { className } = props;

    const { width, isMobile } = useWindowWidth();
    const params = queryString.parse(location.search);

    const userRoles = useSelector(getUserRoles);

    const [_, setParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<string>((params?.tab as string) || '');
    const [isCreateTeamModalOpened, setIsCreateTeamModalOpened] = useState<boolean>(false);

    useEffect(() => {
        setActiveTab(params?.tab as string);
    }, [params?.tab, location.search]);

    const handleChangeActiveTab = useCallback(
        (key: Key) => {
            setActiveTab(key as string);

            const newParams = new URLSearchParams({ tab: key as string });
            setParams(newParams);
        },
        [setParams],
    );

    return (
        <DynamicModuleLoader removeAfterUnmount={false} reducers={{ team: TeamReducer }}>
            <Page className={classNames(classes.FeedPage, {}, [className])}>
                <Helmet
                    title="Мой профиль | Научная карьера"
                    description="Ваш личный профиль в системе учета научной деятельности. Отслеживайте свой прогресс и управляйте информацией о себе."
                />

                <h1 className="text-xl md:leading-none md:text-2xl font-bold text-center w-full">
                    Личный кабинет
                </h1>
                <Tabs
                    classNames={{
                        base: isMobile ? 'w-full' : 'relative mb-10',
                        tabList: isMobile
                            ? 'mb-10 w-full grid grid-cols-2'
                            : 'w-full justify-between sticky top-0',
                        wrapper: 'w-full gap-8',
                        panel: 'bg-card-bg shadow-xl rounded-xl p-4 w-full flex-grow',
                        cursor: 'bg-grad-end',
                    }}
                    isVertical={width > 1024}
                    selectedKey={activeTab}
                    onSelectionChange={handleChangeActiveTab}
                >
                    <Tab key="profile" title="Личная информация">
                        <ProfileInfoBlock />
                    </Tab>
                    <Tab key="settings" title="Данные аккаунта">
                        <AccountSettings />
                    </Tab>
                    <Tab key="portfolio" title="Портфолио">
                        <PortfolioBlock />
                    </Tab>
                    <Tab
                        isDisabled={!userRoles?.includes(UserRoles.PROFILE_CONFIRMED)}
                        key="skills"
                        title="Навыки"
                    >
                        <SkillsBlock />
                    </Tab>
                    <Tab
                        isDisabled={!userRoles?.includes(UserRoles.PROFILE_CONFIRMED)}
                        key="team"
                        title="Команда"
                    >
                        <MyTeamPreviewBlock setCreateTeamModalOpened={setIsCreateTeamModalOpened} />
                        <CreateTeamForm
                            isOpened={isCreateTeamModalOpened}
                            setIsOpened={setIsCreateTeamModalOpened}
                        />
                    </Tab>
                    <Tab
                        isDisabled={!userRoles?.includes(UserRoles.PROFILE_CONFIRMED)}
                        key="proposals"
                        title="Заявки"
                    >
                        <ProposalsBlock />
                    </Tab>
                </Tabs>
            </Page>
        </DynamicModuleLoader>
    );
});

export default FeedPage;
