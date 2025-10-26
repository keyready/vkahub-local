import React, { memo, useCallback, useState } from 'react';
import { Image, Modal, ModalContent } from '@nextui-org/react';
import { useNavigate } from 'react-router-dom';

import classes from './BannedPage.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { Page } from '@/widgets/Page';
import { HStack, VStack } from '@/shared/ui/Stack';
import { TextButton } from '@/shared/ui/TextButton';
import { CreateFeedbackForm } from '@/entities/Feedback';
import { RoutePath } from '@/shared/config/routeConfig';

interface BannedPageProps {
    className?: string;
}

const BannedPage = memo((props: BannedPageProps) => {
    const { className } = props;

    const navigate = useNavigate();

    const [isModalOpened, setIsModalOpened] = useState<boolean>(false);

    const handleFeedbackPageClick = useCallback(() => {
        setIsModalOpened(true);
    }, []);

    const handleRulesReadClick = useCallback(() => {
        navigate(RoutePath.rules);
    }, [navigate]);

    return (
        <Page className={classNames(classes.BannedPage, {}, [className])}>
            <VStack maxW gap="36px">
                <HStack maxW align="center" justify="center">
                    <Image className="w-[40vw]" src="/static/banned-image.webp" />
                </HStack>
                <VStack maxW gap="24px">
                    <h1 className="text-2xl font-bold text-center w-full">
                        Ваш профиль был заблокирован
                    </h1>
                    <VStack maxW gap="0">
                        <h2 className="text-l text-center w-full">
                            Для уточнения причины блокировки или прошения амнистии
                        </h2>
                        <h2 className="text-l text-center w-full">
                            <TextButton onClick={handleFeedbackPageClick}>свяжитесь</TextButton> с
                            администрацией
                        </h2>
                        <p className="mt-5 text-l w-full text-center text-red-500 opacity-70">
                            * прежде, чем беспокоить администрацию,{' '}
                            <TextButton onClick={handleRulesReadClick}>прочтите</TextButton> <br />{' '}
                            еще раз правила пользования сервисом и попробуйте самостоятельно
                            отыскать свои грехи
                        </p>
                    </VStack>
                </VStack>
            </VStack>

            <Modal
                backdrop="blur"
                size="3xl"
                isOpen={isModalOpened}
                onClose={() => setIsModalOpened(false)}
            >
                <ModalContent className="p-8 bg-grad-end dark:bg-card-bg">
                    <CreateFeedbackForm bannedReason />
                </ModalContent>
            </Modal>
        </Page>
    );
});

export default BannedPage;
