/**
 * Я сейчас буду сидеть и заниматься спортивным ориентированием. В собственном коде
 */

import { memo } from 'react';
import { Image } from '@nextui-org/react';
import { useSelector } from 'react-redux';

import classes from './ProfileAchievementsPage.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { Page } from '@/widgets/Page';
import { Helmet } from '@/widgets/Helmet';
import { HStack, VStack } from '@/shared/ui/Stack';
import { useProfileAchievements } from '@/entities/ProfileAchievement';
import { Skeleton } from '@/shared/ui/Skeleton';
import { getUserData } from '@/entities/User';

interface ProfileAchievementsPageProps {
    className?: string;
}

const ProfileAchievementsPage = memo((props: ProfileAchievementsPageProps) => {
    const { className } = props;

    const username = useSelector(getUserData)?.username;

    const { data: profileAchievements, isLoading: isProfileAchievementsLoading } =
        useProfileAchievements(username, {
            refetchOnMountOrArgChange: true,
        });

    if (isProfileAchievementsLoading) {
        return (
            <Page className={classNames(classes.ProfileAchievementsPage, {}, [className])}>
                <Helmet
                    title="Достижения профиля"
                    description="Посмотрите Ваши достижения и узнайте, как зарабатывать очки профиля"
                />

                <VStack maxW gap="48px" className="overflow-y-auto">
                    <VStack maxW gap="12px">
                        <h1 className="text-center md:text-left text-l leading-6 md:leading-none md:text-2xl font-bold">
                            Достижения профиля
                        </h1>
                        <p className="italic text-m md:text-l">
                            По мере участия в жизни проекта, Вы будете получать достижения, за
                            которые будут начисляться очки опыта профиля
                        </p>
                    </VStack>

                    <HStack maxW gap="24px" className="flex-wrap p-4">
                        {new Array(10).fill(0).map((_, index) => (
                            <Skeleton key={index} width={208} height={240} rounded="12" />
                        ))}
                    </HStack>
                </VStack>
            </Page>
        );
    }

    if (!profileAchievements?.length) {
        return (
            <Page className={classNames(classes.ProfileAchievementsPage, {}, [className])}>
                <Helmet
                    title="Достижения профиля"
                    description="Посмотрите Ваши достижения и узнайте, как зарабатывать очки профиля"
                />
                <VStack maxW gap="12px">
                    <h1 className="text-center md:text-left text-l leading-6 md:leading-none md:text-2xl font-bold">
                        Достижения профиля
                    </h1>
                    <p className="italic text-m md:text-l">
                        По мере участия в жизни проекта, Вы будете получать достижения, за которые
                        будут начисляться очки опыта профиля
                    </p>
                </VStack>

                <h2 className="opacity-50 mt-5 italic text-l">
                    Вы пока не получили ни одного достижения...
                </h2>
            </Page>
        );
    }

    return (
        <Page className={classNames(classes.ProfileAchievementsPage, {}, [className])}>
            <Helmet
                title="Достижения профиля"
                description="Посмотрите Ваши достижения и узнайте, как зарабатывать очки профиля"
            />

            <VStack maxW gap="48px" className="overflow-y-auto">
                <VStack maxW gap="12px">
                    <h1 className="text-center md:text-left text-xl leading-6 md:leading-none md:text-2xl font-bold">
                        Достижения профиля
                    </h1>
                    <p className="italic leading-none text-m md:text-l">
                        По мере участия в жизни проекта, Вы будете получать достижения, за которые
                        будут начисляться очки опыта профиля
                    </p>
                </VStack>

                <HStack maxW gap="24px" className="flex-wrap p-4">
                    {[...profileAchievements]
                        .sort((a, b) => a.title.localeCompare(b.title))
                        .sort((a, b) => a.rarity - b.rarity)
                        .map((profileAchievement, index) => (
                            <VStack
                                key={index}
                                align="center"
                                className={classNames(classes.AchievementCardWrapper, {}, [
                                    'relative w-36 h-40 md:h-60 md:w-52 bg-card-bg p-2 rounded-xl',
                                ])}
                            >
                                <div className="rounded-xl w-24 h-24 md:w-48 md:h-48">
                                    <Image
                                        src={`/static/achievements/${profileAchievement.image}`}
                                    />
                                </div>
                                <h1 className="text-center w-full">{profileAchievement.title}</h1>
                                <p className={classes.achievementDescription}>
                                    {profileAchievement.description}
                                </p>
                            </VStack>
                        ))}
                </HStack>
            </VStack>
        </Page>
    );
});

export default ProfileAchievementsPage;
