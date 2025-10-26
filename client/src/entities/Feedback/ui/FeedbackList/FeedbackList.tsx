import { Image } from '@nextui-org/react';

import { FeedbackCard } from '../FeedbackCard/FeedbackCard';
import { useFeedback } from '../../api/FeedbackApi';

import { classNames } from '@/shared/lib/classNames';
import { VStack } from '@/shared/ui/Stack';
import { Skeleton } from '@/shared/ui/Skeleton';

interface FeedbackListProps {
    className?: string;
}

export const FeedbackList = (props: FeedbackListProps) => {
    const { className } = props;

    const { data: feedback, isLoading: isFeedbackLoading } = useFeedback(undefined, {
        refetchOnMountOrArgChange: true,
    });

    if (isFeedbackLoading) {
        return (
            <VStack maxW gap="12px" className={classNames('', {}, [className])}>
                {new Array(10).fill(0).map((_, index) => (
                    <VStack
                        gap="16px"
                        className="border-3 border-main-bg p-4 rounded-xl"
                        maxW
                        key={index}
                    >
                        <Skeleton width={200} height={25} />
                        <VStack maxW>
                            <Skeleton width="81%" height={14} />
                            <Skeleton width="81%" height={14} />
                            <Skeleton width="81%" height={14} />
                            <Skeleton width="45%" height={14} />
                        </VStack>
                    </VStack>
                ))}
            </VStack>
        );
    }

    if (!isFeedbackLoading && !feedback?.length) {
        return (
            <VStack
                align="center"
                justify="center"
                maxW
                maxH
                gap="12px"
                className={classNames('flex-grow', {}, [className])}
            >
                <Image className="w-[350px] h-[200px]" src="/static/no-feedback.webp" />
                <h1 className="text-l text-center italic opacity-60">
                    Пользователям насрать на ваш проект ;(
                </h1>
            </VStack>
        );
    }

    return (
        <VStack maxW gap="12px" className={classNames('', {}, [className])}>
            {feedback?.map((feedbackItem) => (
                <FeedbackCard key={feedbackItem.id} feedback={feedbackItem} />
            ))}
        </VStack>
    );
};
