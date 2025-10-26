import { Button } from '@nextui-org/react';
import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';

import { useEvents } from '../../api/fetchEventsApi';
import { createReport } from '../../model/services/createReport';
import { getIsReportCreating } from '../../model/selectors/EventSeceltors';
import { EventReducer } from '../../model/slice/EventSlice';

import { HStack, VStack } from '@/shared/ui/Stack';
import { classNames } from '@/shared/lib/classNames';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { toastDispatch } from '@/widgets/Toaster';
import { DynamicModuleLoader } from '@/shared/lib/DynamicModuleLoader';
import { Skeleton } from '@/shared/ui/Skeleton';

interface DownloadLinkProps {
    link?: string;
    eventId?: number;
}

interface CreateReportTabProps {
    className?: string;
}

export const CreateReportTab = (props: CreateReportTabProps) => {
    const { className } = props;

    const { data: events, isLoading: isEventsLoading } = useEvents('all');

    const dispatch = useAppDispatch();

    const isReportCreating = useSelector(getIsReportCreating);

    const [downloadLink, setDownloadLink] = useState<DownloadLinkProps>({});

    const handleGenerateReportClick = useCallback(
        async (eventId: number) => {
            const result = await toastDispatch(dispatch(createReport(eventId)));

            if (result.meta.requestStatus === 'fulfilled') {
                setDownloadLink({
                    eventId,
                    link: result.payload.reportName,
                });
            }
        },
        [dispatch],
    );

    if (isEventsLoading) {
        return (
            <DynamicModuleLoader reducers={{ event: EventReducer }}>
                <VStack gap="0" maxW className="mb-5">
                    <h1 className="text-l">Генерация рапортов на соревнования</h1>
                    <p className="italic opacity-40">
                        В сгенерированных рапортах отображается основная информация (участники,
                        название мероприятия, даты проведения).
                    </p>
                    <p className="italic opacity-40">
                        <span className="underline font-bold">Необходимы</span> дополнительные
                        правки перед печатью
                    </p>
                </VStack>
                <VStack gap="12px" maxW className="mb-5">
                    {new Array(7).fill(0).map((_, index) => (
                        <HStack
                            className="border-1 border-accent py-2 px-3 rounded-md"
                            justify="between"
                            key={index}
                            maxW
                        >
                            <Skeleton width="30%" height={22} />
                            <Skeleton width="20%" height={28} />
                        </HStack>
                    ))}
                </VStack>
            </DynamicModuleLoader>
        );
    }

    return (
        <DynamicModuleLoader reducers={{ event: EventReducer }}>
            <VStack gap="0" maxW className="mb-5">
                <h1 className="text-l">Генерация рапортов на соревнования</h1>
                <p className="italic opacity-40">
                    В сгенерированных рапортах отображается основная информация (участники, название
                    мероприятия, даты проведения).
                </p>
                <p className="italic opacity-40">
                    <span className="underline font-bold">Необходимы</span> дополнительные правки
                    перед печатью
                </p>
            </VStack>
            <VStack gap="12px" maxW className={classNames('', {}, [className])}>
                {events?.length
                    ? events.map((event) => (
                          <HStack
                              className="border-1 border-accent py-2 px-3 rounded-md"
                              justify="between"
                              key={event.id}
                              maxW
                          >
                              <h1>{event.title}</h1>
                              {downloadLink.eventId === event.id ? (
                                  <Button
                                      radius="sm"
                                      isDisabled={isReportCreating}
                                      isLoading={isReportCreating}
                                      className="h-fit py-1 px-3"
                                      color="success"
                                  >
                                      <a
                                          download
                                          href={`https://storage.yandexcloud.net/vkahub-storage/${downloadLink.link}`}
                                      >
                                          Скачать рапорт
                                      </a>
                                  </Button>
                              ) : (
                                  <Button
                                      radius="sm"
                                      isDisabled={isReportCreating}
                                      isLoading={isReportCreating}
                                      color="warning"
                                      className="h-fit py-1 px-3"
                                      onClick={() => handleGenerateReportClick(event.id)}
                                  >
                                      {isReportCreating
                                          ? 'Создаем рапорт...'
                                          : 'Сформировать рапорт'}
                                  </Button>
                              )}
                          </HStack>
                      ))
                    : null}
            </VStack>
        </DynamicModuleLoader>
    );
};
