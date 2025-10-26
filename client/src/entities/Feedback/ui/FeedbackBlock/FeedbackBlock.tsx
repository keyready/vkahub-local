import { classNames } from '@/shared/lib/classNames';
import { VStack } from '@/shared/ui/Stack';
import { FeedbackList } from '@/entities/Feedback/ui/FeedbackList/FeedbackList';

interface FeedbackBlockProps {
    className?: string;
}

export const FeedbackBlock = (props: FeedbackBlockProps) => {
    const { className } = props;

    return (
        <VStack gap="18px" maxW className={classNames('', {}, [className])}>
            <VStack maxW gap="0px">
                <h1 className="text-primary text-l">Отзывы пользователей</h1>
                <p className="italic">
                    Здесь отображаются предложения и пожелания, которыми пользователи хотели
                    поделиться с разработчиками
                </p>
            </VStack>

            <FeedbackList />
        </VStack>
    );
};
