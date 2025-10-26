import { Feedback } from '../../model/types/Feedback';

import { classNames } from '@/shared/lib/classNames';
import { HStack, VStack } from '@/shared/ui/Stack';

interface FeedbackCardProps {
    className?: string;
    feedback: Feedback;
}

export const FeedbackCard = (props: FeedbackCardProps) => {
    const { className, feedback } = props;

    return (
        <VStack
            gap="12px"
            className={classNames('border-3 border-main-bg p-4 rounded-xl', {}, [className])}
            maxW
        >
            <HStack maxW justify="between">
                <h1 className="text-l font-bold tracking-widest">{feedback.author}</h1>
                <p>{new Date(feedback.createdAt).toLocaleDateString()}</p>
            </HStack>
            <p className="text-sm italic">{feedback.message}</p>
        </VStack>
    );
};
