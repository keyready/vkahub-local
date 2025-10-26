import React from 'react';
import { Tab, Tabs } from '@nextui-org/react';

import { classNames } from '@/shared/lib/classNames';
import { Page } from '@/widgets/Page';
import {
    CreateEventForm,
    CreateEventParseForm,
    CreateReportTab,
    EventReducer,
} from '@/entities/Event';
import { useWindowWidth } from '@/shared/lib/hooks/useWindowWidth';
import { CreateTrackForm, TrackReducer } from '@/entities/Track';
import { DynamicModuleLoader } from '@/shared/lib/DynamicModuleLoader';
import { FeedbackBlock } from '@/entities/Feedback';
import { BugsBlock } from '@/entities/Bug';

interface AdminPageProps {
    className?: string;
}

const AdminPage = (props: AdminPageProps) => {
    const { className } = props;

    const { width } = useWindowWidth();

    return (
        <DynamicModuleLoader reducers={{ track: TrackReducer, event: EventReducer }}>
            <Page className={classNames('relative', {}, [className])}>
                <h1 className="mb-14 text-2xl font-bold text-center w-full">
                    Модерирование контента
                </h1>

                <Tabs
                    classNames={{
                        base: width < 1024 ? 'w-full' : '',
                        tabList: width < 1024 ? 'mb-10 w-full sticky top-0' : 'sticky top-0',
                        wrapper: 'w-full gap-8',
                        panel: 'bg-card-bg shadow-xl rounded-xl p-4 w-full flex-grow',
                    }}
                    isVertical={width > 1024}
                >
                    <Tab title="Автоматическое добавление" key="automatic">
                        <CreateEventParseForm />
                    </Tab>
                    <Tab title="Ручное создание" key="manual">
                        <CreateEventForm />
                    </Tab>
                    <Tab title="Добавление трека" key="track-creating">
                        <CreateTrackForm />
                    </Tab>
                    <Tab isDisabled title="Направления и навыки" key="skills-positions">
                        <CreateTrackForm />
                    </Tab>
                    <Tab title="Документы" key="documents">
                        <CreateReportTab />
                    </Tab>
                    <Tab title="Отзывы" key="feedbacks">
                        <FeedbackBlock />
                    </Tab>
                    <Tab title="Жалобы" key="complaints">
                        <BugsBlock />
                    </Tab>
                </Tabs>
            </Page>
        </DynamicModuleLoader>
    );
};

export default AdminPage;
