import { Tab, Tabs } from '@nextui-org/react';
import { useSearchParams } from 'react-router-dom';
import { Key, useCallback, useEffect, useState } from 'react';
import queryString from 'query-string';
import { useSelector } from 'react-redux';

import { classNames } from '@/shared/lib/classNames';
import { Page } from '@/widgets/Page';
import { BugReducer, CreateBugReportForm, getIsBugCreating } from '@/entities/Bug';
import { CreateFeedbackForm, FeedbackReducer, getIsFeedbackCreating } from '@/entities/Feedback';
import { useWindowWidth } from '@/shared/lib/hooks/useWindowWidth';
import { VStack } from '@/shared/ui/Stack';
import { DynamicModuleLoader } from '@/shared/lib/DynamicModuleLoader';

interface FeedbackPageProps {
    className?: string;
}

const FeedbackPage = (props: FeedbackPageProps) => {
    const { className } = props;

    const { width } = useWindowWidth();
    const params = queryString.parse(location.search);

    const [_, setParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<string>((params?.tab as string) || '');
    const [errorBoundaryFrom, setErrorBoundaryFrom] = useState<string>('');

    const isFeedbackCreating = useSelector(getIsFeedbackCreating);
    const isBugReporting = useSelector(getIsBugCreating);

    const handleChangeActiveTab = useCallback(
        (key: Key) => {
            setActiveTab(key as string);

            const newParams = new URLSearchParams({ tab: key as string });
            setParams(newParams);
        },
        [setParams],
    );

    useEffect(() => {
        setActiveTab(params?.tab as string);
        setErrorBoundaryFrom((params?.from as string) || '');
    }, [params?.tab, params?.from, location.search]);

    return (
        <DynamicModuleLoader reducers={{ bug: BugReducer, feedback: FeedbackReducer }}>
            <Page className={classNames('', {}, [className])}>
                <VStack maxW gap="24px" className="relative">
                    <h1 className="mt-2 w-full text-center leading-5 text-xl md:leading-none md:text-2xl font-bold">
                        Отзывы, жалобы и предложения
                    </h1>

                    <Tabs
                        classNames={{
                            base: width < 1024 ? 'w-full' : '',
                            tabList: width < 1024 ? 'mb-10 w-full sticky top-0' : 'sticky top-0',
                            wrapper: 'w-full gap-8',
                            panel: 'bg-card-bg shadow-xl rounded-xl p-4 w-full flex-grow',
                        }}
                        isVertical={width > 1024}
                        selectedKey={activeTab}
                        onSelectionChange={handleChangeActiveTab}
                    >
                        <Tab
                            isDisabled={isFeedbackCreating || isBugReporting}
                            key="feedback"
                            title="Оставить отзыв"
                        >
                            <CreateFeedbackForm />
                        </Tab>
                        <Tab
                            isDisabled={isBugReporting || isFeedbackCreating}
                            key="bug-report"
                            title="Сообщить о проблеме"
                        >
                            <CreateBugReportForm from={errorBoundaryFrom} />
                        </Tab>
                    </Tabs>
                </VStack>
            </Page>
        </DynamicModuleLoader>
    );
};

export default FeedbackPage;
