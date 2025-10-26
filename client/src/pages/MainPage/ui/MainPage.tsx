import { useCallback, useEffect, useState } from 'react';
import { Image } from '@nextui-org/react';
import { RiCommandLine, RiSparkling2Line, RiTeamLine, RiUser2Line } from '@remixicon/react';

import classes from './MainPage.module.scss';

import { Page } from '@/widgets/Page';
import { classNames } from '@/shared/lib/classNames';
import { Helmet } from '@/widgets/Helmet';
import { HStack, VStack } from '@/shared/ui/Stack';
import { useSockets } from '@/shared/api/useSockets';
import { NumberAnimation } from '@/shared/ui/AnimatedNumber';
import { useWindowWidth } from '@/shared/lib/hooks/useWindowWidth';

interface Statistics {
    totalUsers?: number;
    onlineClients?: number;
    totalTeams?: number;
    totalWinners?: number;
    totalEvents?: number;
}

const MainPage = () => {
    const { data, error } = useSockets<string, void>();

    const [statistics, setStatistics] = useState<Statistics>();

    const { isMobile } = useWindowWidth();

    useEffect(() => {
        if (data) {
            setStatistics(JSON.parse(data));
        }
    }, [data, error]);

    useEffect(() => {}, []);

    const normalize_count_form = useCallback((number: number, words_arr: string[]) => {
        number = Math.abs(number);
        if (Number.isInteger(number)) {
            const options = [2, 0, 1, 1, 1, 2];
            return words_arr[
                number % 100 > 4 && number % 100 < 20
                    ? 2
                    : options[number % 10 < 5 ? number % 10 : 5]
            ];
        }
        return words_arr[1];
    }, []);

    return (
        <Page className={classNames(classes.MainPage, {}, [])}>
            <Helmet
                title="Главная | Учет и контроль научной деятельности"
                description={
                    'Стартовая страница системы учета и контроля научной деятельности обучающихся. ' +
                    'Здесь вы найдете обзор текущих проектов, команд и участников.'
                }
            />

            <VStack maxW gap="24px">
                <HStack maxW align="start" gap="24px">
                    {!isMobile && (
                        <Image
                            width={300}
                            height={300}
                            classNames={{
                                wrapper: classes.MainPageLogo,
                            }}
                            src="/static/hello-message-pict.webp"
                        />
                    )}
                    <VStack
                        maxW
                        justify="center"
                        gap="32px"
                        className="rounded-xl p-4 border-input-hover-bg border-4 min-h-[300px]"
                    >
                        <p className={`text-l ${isMobile && 'text-center'}`}>
                            <span className="text-accent font-bold">VKA.HUB</span> — это
                            специализированная платформа, предназначенная для организации, хранения
                            и мониторинга активности курсантов Академии, которые принимают участие в
                            работе Военно-научного общества 61 кафедры. Платформа автоматизирует
                            процесс сбора данных о научной и учебной деятельности курсантов,
                            отслеживает их участие в исследовательских проектах, конкурсах,
                            конференциях и других мероприятиях.
                        </p>
                        <p className={`text-l ${isMobile && 'text-center'}`}>
                            Кроме того, <span className="text-accent font-bold">VKA.HUB</span>{' '}
                            позволяет вести учет личных достижений каждого курсанта, что упрощает
                            процесс анализа их успехов и помогает в дальнейшем планировании научной
                            работы и карьерного роста.
                        </p>
                    </VStack>
                </HStack>

                <HStack
                    justify="center"
                    flexGrow
                    align="center"
                    maxW
                    className={
                        isMobile
                            ? 'grid grid-cols-2 gap-4 justify-items-center'
                            : 'px-10 py-8 gap-10'
                    }
                >
                    <VStack align="center" className="w-36 h-40 p-5 bg-input-hover-bg rounded-md">
                        <RiUser2Line className="text-accent" size={24} />
                        <NumberAnimation>{statistics?.totalUsers || 0}</NumberAnimation>
                        <p className="text-primary">
                            {normalize_count_form(statistics?.totalUsers || 0, [
                                'пользователь',
                                'пользователя',
                                'пользователей',
                            ])}{' '}
                            <br />в проекте
                        </p>
                    </VStack>

                    <VStack align="center" className="w-36 h-40 p-5 bg-input-hover-bg rounded-md">
                        <div className="w-5 h-5 rounded-full bg-green-500" />
                        <NumberAnimation>{statistics?.onlineClients || 0}</NumberAnimation>
                        <p className="ml-1 text-primary">
                            {normalize_count_form(statistics?.onlineClients || 0, [
                                'пользователь',
                                'пользователя',
                                'пользователей',
                            ])}
                            <br />
                            онлайн
                        </p>
                    </VStack>

                    <VStack align="center" className="w-36 h-40 p-5 bg-input-hover-bg rounded-md">
                        <RiTeamLine className="text-accent" size={24} />
                        <NumberAnimation>{statistics?.totalTeams || 0}</NumberAnimation>
                        <p className="text-primary">
                            {normalize_count_form(statistics?.totalTeams || 0, [
                                'команда',
                                'команды',
                                'команд',
                            ])}
                        </p>
                    </VStack>

                    <VStack align="center" className="w-36 h-40 p-5 bg-input-hover-bg rounded-md">
                        <RiCommandLine className="text-accent" size={24} />
                        <NumberAnimation>{statistics?.totalEvents || 0}</NumberAnimation>
                        <p className="text-primary">
                            {normalize_count_form(statistics?.totalEvents || 0, [
                                'соревнование',
                                'соревнования',
                                'соревнований',
                            ])}
                        </p>
                    </VStack>

                    <VStack
                        align="center"
                        className={`w-36 h-40 p-5 bg-input-hover-bg rounded-md ${
                            isMobile && 'col-span-2 w-[90%]'
                        }`}
                    >
                        <RiSparkling2Line className="text-accent" size={24} />
                        <NumberAnimation>{statistics?.totalWinners || 0}</NumberAnimation>
                        <p className="text-primary">
                            {normalize_count_form(statistics?.totalWinners || 0, [
                                'победитель',
                                'победителя',
                                'победителей',
                            ])}
                        </p>
                    </VStack>
                </HStack>
            </VStack>
        </Page>
    );
};

export default MainPage;
