import { memo, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Accordion,
    AccordionItem,
    BreadcrumbItem,
    Breadcrumbs,
    Chip,
    Image,
} from '@nextui-org/react';

import classes from './DetailedMemberPage.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { Page } from '@/widgets/Page';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { getProfileData, getSelectedProfileData, getUserIsLoading } from '@/entities/User';
import { RoutePath } from '@/shared/config/routeConfig';
import { HStack, VStack } from '@/shared/ui/Stack';
import { Helmet } from '@/widgets/Helmet';
import { MemberAchievementsTable } from '@/entities/Achievement';
import { Skeleton } from '@/shared/ui/Skeleton';
import { AppLink } from '@/shared/ui/AppLink';
import { fetchTeam } from '@/entities/Team';
import { AchievementsPreviewList } from '@/entities/ProfileAchievement';
import { useWindowWidth } from '@/shared/lib/hooks/useWindowWidth';
import { PortfolioItem } from '@/entities/User/ui/ProfileBlocks/PortfolioBlock/PortfolioItem';

interface DetailedMemberPageProps {
    className?: string;
}

const DetailedMemberPage = memo((props: DetailedMemberPageProps) => {
    const { className } = props;

    const { username } = useParams<{ username: string }>();

    const dispatch = useAppDispatch();
    const isUserLoading = useSelector(getUserIsLoading);
    const member = useSelector(getSelectedProfileData);

    const { isMobile } = useWindowWidth();

    const [userTeamTitle, setUserTeamTitle] = useState<string>('');

    useEffect(() => {
        document.title = 'Загрузка...';
    }, [member?.firstname, member?.lastname, username]);

    useEffect(() => {
        if (username) {
            dispatch(getProfileData(username));
        }
    }, [username, dispatch]);

    useEffect(() => {
        const fetchUserTeamTitle = async () => {
            if (member?.teamId) {
                const result = await dispatch(fetchTeam(member.teamId.toString()));
                if (result?.payload && typeof result.payload !== 'string') {
                    setUserTeamTitle(result.payload.title);
                }
            }
        };

        fetchUserTeamTitle();
    }, [dispatch, member?.teamId]);

    if (!username) {
        return <Navigate to={RoutePath.members} />;
    }

    if (isUserLoading) {
        return (
            <Page className={classNames(classes.DetailedMemberPage, {}, [className])}>
                <HStack className="mt-16" maxH justify="between" align="start" maxW gap="32px">
                    {!isMobile && (
                        <VStack align="start" justify="start">
                            <Skeleton width={400} height={400} rounded={24} />
                        </VStack>
                    )}

                    <VStack gap="24px" maxW>
                        <HStack gap="12px" maxW className="w-full" align="center">
                            <Skeleton width={180} height={35} />
                            <Skeleton width={180} height={35} />
                        </HStack>

                        <VStack
                            gap="12px"
                            maxW
                            className="flex-grow h-full p-5 rounded-xl bg-card-bg"
                        >
                            <VStack maxW>
                                <p className="opacity-30 text-m">О себе</p>
                                <Skeleton width="100%" height={15} />
                                <Skeleton width="100%" height={15} />
                                <Skeleton width="100%" height={15} />
                                <Skeleton width="75%" height={15} />
                            </VStack>
                            <hr className="w-full border-t-2 border-main-bg" />
                            <HStack maxW gap="12px" className="flex-wrap">
                                <Skeleton width="50%" height={15} />
                            </HStack>
                        </VStack>

                        <VStack
                            gap="0"
                            maxW
                            className="h-full flex-grow relative py-0 rounded-xl bg-card-bg overflow-y-auto"
                        >
                            <h2 className="px-5 w-full bg-card-bg pt-5 sticky top-0 text-l underline underline-offset-2">
                                Достижения
                            </h2>
                            <VStack gap="12px" maxW className="p-4">
                                <Skeleton width="100%" height={35} />
                                <Skeleton width="100%" height={35} />
                                <Skeleton width="100%" height={35} />
                                <Skeleton width="100%" height={35} />
                                <Skeleton width="100%" height={35} />
                            </VStack>
                        </VStack>
                    </VStack>
                </HStack>
            </Page>
        );
    }

    if (!isUserLoading && !member?.id) {
        return (
            <Page className="flex">
                <VStack gap="14px" flexGrow align="center" justify="center" maxW>
                    <h1 className="text-2xl italic w-full text-center">
                        Информация об участнике не получена
                    </h1>
                    <AppLink className="text-l" to={RoutePath.members}>
                        Вернуться к списку всех участников
                    </AppLink>
                </VStack>
            </Page>
        );
    }

    return (
        <Page className={classNames(classes.DetailedMemberPage, {}, [className])}>
            <Helmet
                title={`${member?.firstname} | Профиль`}
                description={`Личный профиль ${member?.firstname}. Просмотрите его проекты, достижения и вклад в научную деятельность.`}
            />

            <Breadcrumbs
                className="mb-10"
                itemClasses={{
                    item: 'data-[current=true]:text-accent',
                }}
            >
                <BreadcrumbItem href={RoutePath.main}>Главная</BreadcrumbItem>
                <BreadcrumbItem href={RoutePath.members}>Все участники</BreadcrumbItem>
                <BreadcrumbItem href={RoutePath.member + member?.username}>
                    {member?.firstname}
                </BreadcrumbItem>
            </Breadcrumbs>

            <HStack justify="between" align="start" maxW gap="32px" className="h-full">
                {!isMobile && (
                    <VStack>
                        <Image
                            fallbackSrc="/static/fallbacks/user-fallback.webp"
                            classNames={{ wrapper: classes.blurredBackgroundImage }}
                            src={`https://storage.yandexcloud.net/vkahub-storage/${member?.avatar}`}
                            className="w-[400px] h-[400px]"
                            alt={member?.username}
                        />

                        <AchievementsPreviewList username={username} />
                    </VStack>
                )}

                <VStack gap="24px" maxW>
                    <VStack gap="12px" maxW className="w-full" justify="between" align="center">
                        <HStack justify="between" maxW>
                            <h1 className="text-left text-xl md:text-2xl font-bold leading-none">
                                {member?.lastname} {member?.firstname}
                            </h1>
                            <h2 className="text-right leading-none">
                                Участник сообщества с <br />
                                {new Date(member?.created_at || '').toLocaleDateString('ru-RU')}
                            </h2>
                        </HStack>
                        {isMobile && <AchievementsPreviewList username={username} />}
                    </VStack>

                    <VStack gap="12px" maxW className="flex-grow h-full p-5 rounded-xl bg-card-bg">
                        {member?.description && (
                            <VStack maxW>
                                <p className="opacity-30 text-m">О себе</p>
                                <p className="italic">{member?.description}</p>
                            </VStack>
                        )}
                        {member?.positions?.length ? (
                            <>
                                <hr className="w-full border-t-2 border-main-bg" />
                                <HStack maxW gap="12px" className="flex-wrap">
                                    <p>
                                        <span className="font-bold">{member?.firstname}</span>{' '}
                                        работает на позициях:{' '}
                                    </p>
                                    {member?.positions?.map((position, index) => (
                                        <Chip
                                            key={index}
                                            className="capitalize"
                                            variant="bordered"
                                            color="warning"
                                        >
                                            {position}
                                        </Chip>
                                    ))}
                                </HStack>
                            </>
                        ) : null}
                        {member?.skills?.length ? (
                            <>
                                {!member?.positions?.length ? (
                                    <hr className="w-full border-t-2 border-main-bg" />
                                ) : null}
                                <HStack maxW gap="12px" className="flex-wrap">
                                    <p>
                                        <span className="font-bold">{member?.firstname}</span> силен
                                        в{' '}
                                    </p>
                                    {member?.skills?.map((skill, index) => (
                                        <Link
                                            target="_blank"
                                            key={index}
                                            to={`${RoutePath.members}?skills=${skill}`}
                                        >
                                            <Chip
                                                className="capitalize"
                                                variant="bordered"
                                                color="warning"
                                            >
                                                {skill}
                                            </Chip>
                                        </Link>
                                    ))}
                                </HStack>
                            </>
                        ) : null}
                        {member?.description && <hr className="w-full border-t-2 border-main-bg" />}
                        <HStack maxW gap="12px" className="flex-wrap">
                            {member?.teamId ? (
                                <p>
                                    {member?.firstname} состоит в команде{' '}
                                    <span className="font-bold">{userTeamTitle}</span>
                                </p>
                            ) : (
                                <p>{member?.firstname} не состоит в команде. </p>
                            )}
                        </HStack>
                    </VStack>

                    <VStack
                        maxW
                        className="h-full flex-grow relative py-0 rounded-xl bg-card-bg overflow-y-auto"
                    >
                        <MemberAchievementsTable name={member?.firstname} userId={member?.id} />
                    </VStack>

                    <VStack gap="0" maxW className="flex-grow h-full px-2 rounded-xl bg-card-bg">
                        {member?.portfolio?.length ? (
                            <Accordion>
                                <AccordionItem
                                    classNames={{ title: 'text-sm text-accent' }}
                                    title="Показать сертификаты"
                                >
                                    <div className="flex flex-wrap items-center gap-5">
                                        {member.portfolio.map((file, index) => (
                                            <PortfolioItem
                                                size="sm"
                                                file={file}
                                                index={index}
                                                key={index}
                                            />
                                        ))}
                                    </div>
                                </AccordionItem>
                            </Accordion>
                        ) : (
                            <p className="text-m py-5 opacity-30">
                                {member?.firstname} пока не добавил ни одного сертификата
                            </p>
                        )}
                    </VStack>
                </VStack>
            </HStack>
        </Page>
    );
});

export default DetailedMemberPage;
