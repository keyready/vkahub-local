import React, { memo } from 'react';
import { RiArticleLine, RiChatPrivateLine, RiEyeLine } from '@remixicon/react';
import { Image } from '@nextui-org/react';

import classes from './CommunityRulesPage.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { Page } from '@/widgets/Page';
import { HStack, VStack } from '@/shared/ui/Stack';
import { useWindowWidth } from '@/shared/lib/hooks/useWindowWidth';

interface CommunityRulesPageProps {
    className?: string;
}

const CommunityRulesPage = memo((props: CommunityRulesPageProps) => {
    const { className } = props;

    const { isMobile } = useWindowWidth();

    return (
        <Page className={classNames(classes.CommunityRulesPage, {}, [className])}>
            <VStack maxW gap="48px">
                <VStack maxW>
                    <h1 className="mt-5 text-xl md:text-2xl font-bold text-center w-full">
                        Правила пользования сервисом
                    </h1>
                    <VStack maxW gap="0">
                        <p className="mt-5 text-m tmd:ext-l text-center w-full">
                            В нашем проекты предусмотрена достаточно суровая система блокировки
                            аккаунтов пользователей.
                        </p>
                        <p className="text-m md:text-l text-center w-full">
                            Чтобы избежать неприятностей и не получить роль{' '}
                            <span className="text-red-600 font-bold">BANNED</span>, следуйте этим
                            несложным правилам:
                        </p>
                    </VStack>
                </VStack>

                <HStack maxW align="start" gap="48px" className="relative">
                    <VStack className={isMobile ? 'w-full' : 'w-[75vw]'} gap="24px" align="start">
                        <HStack maxW gap="24px" align="start">
                            <RiEyeLine className="text-accent" size={48} />
                            <VStack maxW>
                                <h1 className="text-l font-bold">Ведите себя культурно</h1>
                                <p className="text-m text-justify">
                                    Всегда помните: за Вами следят. Не нужно использовать
                                    политически окрашенные названия и описания команд, никнеймы и
                                    статусы профиля. Наша команда модераторов хоть не большая, но
                                    зато очень бдительная. За всеми придут, никто не скроется.
                                </p>
                            </VStack>
                        </HStack>

                        <HStack maxW gap="24px" align="start">
                            <RiArticleLine className="text-accent" size={48} />
                            <VStack maxW>
                                <h1 className="text-l font-bold">Отчетность — прежде всего</h1>
                                <p className="text-m text-justify">
                                    В наше время, как и в любое другое, отчет о проведении
                                    меропрития — массив фотокарточек. Увы, скринами мы не принимаем,
                                    поэтому в течение суток (24-х часов) капитану команды необходимо
                                    заполнить специальную форму в Личном кабинете с указанием
                                    результата на крайнем мероприятии. В противном случае, все
                                    участники команды будут заблокированы. Не думайте, что Вы
                                    сможете зарегистрировать новый аккаунт — Ваши данные остаются на
                                    серверах, а зарегистрировать второй такой же профиль у Вас не
                                    получится. А как регистрация под другим именем скажется на
                                    попадание в заветный рапорт — думайте сами.
                                </p>
                            </VStack>
                        </HStack>

                        <HStack maxW gap="24px" align="start">
                            <RiChatPrivateLine className="text-accent" size={48} />
                            <VStack maxW>
                                <h1 className="text-l font-bold">Думайте над тем, что пишете</h1>
                                <p className="text-m text-justify">
                                    Наше приложение не идеально, мы знаем. Например, существует
                                    множество навыков и направлений, которые мы забыли добавить.
                                    Поэтому мы дали возможность ВАМ добавлять их в ручном режиме.
                                    Используйте ее с умом, потому что добавленные сообществом навыки
                                    и направления деятельности имеют особую отметку, и любой другой
                                    пользователь может пожаловаться на некультурное поведение
                                    автора. Нарушение — бан! Да, мы жестоки.
                                </p>
                            </VStack>
                        </HStack>
                    </VStack>

                    {!isMobile && (
                        <Image
                            classNames={{
                                wrapper: 'max-w-[25vw] sticky top-0',
                            }}
                            src="/static/rules-page.webp"
                        />
                    )}
                </HStack>
            </VStack>
        </Page>
    );
});

export default CommunityRulesPage;
