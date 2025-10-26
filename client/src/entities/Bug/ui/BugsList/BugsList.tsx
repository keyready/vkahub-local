import { Image } from '@nextui-org/react';
import { useMemo, useState } from 'react';

import { SelectBug } from '../SelectBug/SelectBug';

import { classNames } from '@/shared/lib/classNames';
import { useBugs } from '@/entities/Bug/api/BugsApi';
import { HStack, VStack } from '@/shared/ui/Stack';
import { Skeleton } from '@/shared/ui/Skeleton';
import { BugStatus } from '@/entities/Bug';
import { BugCard } from '@/entities/Bug/ui/BugCard/BugCard';

interface BugsListProps {
    className?: string;
}

export const BugsList = (props: BugsListProps) => {
    const { className } = props;

    const [selectedKey, setSelectedKey] = useState<string>(BugStatus.OPENED);

    const {
        data: bugsReports,
        isLoading,
        isFetching,
    } = useBugs(selectedKey, {
        refetchOnMountOrArgChange: true,
    });

    const content = useMemo(() => {
        if (isLoading || isFetching) {
            return new Array(10).fill(0).map((_, index) => (
                <VStack
                    gap="16px"
                    className="border-3 border-main-bg p-4 rounded-xl"
                    maxW
                    key={index}
                >
                    <HStack maxW justify="between">
                        <Skeleton width={200} height={25} />
                        <Skeleton width={100} height={15} />
                    </HStack>
                    {new Array(4).fill(0).map((_, index) => (
                        <VStack maxW key={index}>
                            <Skeleton width="81%" height={14} />
                            <Skeleton width="81%" height={14} />
                            <Skeleton width="81%" height={14} />
                            <Skeleton width="45%" height={14} />
                        </VStack>
                    ))}
                </VStack>
            ));
        }

        if (!bugsReports?.length && !isLoading) {
            return (
                <VStack maxW>
                    <VStack
                        align="center"
                        justify="center"
                        maxW
                        maxH
                        gap="12px"
                        className={classNames('flex-grow', {}, [className])}
                    >
                        <Image className="w-[350px] h-[200px]" src="/static/no-bugs.webp" />
                        <h1 className="text-l text-center italic opacity-60">
                            Быть такого не может, но пока без жуков ;(
                        </h1>
                    </VStack>
                </VStack>
            );
        }

        return (
            <>
                {bugsReports?.map((bugReport) => (
                    <BugCard
                        defaultSelectedKey={selectedKey}
                        key={bugReport.id}
                        bugReport={bugReport}
                    />
                ))}
            </>
        );
    }, [bugsReports, className, isFetching, isLoading, selectedKey]);

    return (
        <VStack gap="18px" maxW className={classNames('', {}, [className])}>
            <HStack gap="12px" maxW>
                <h1 className="font-bold">Отображать:</h1>
                <SelectBug
                    defaultValue={BugStatus.OPENED}
                    selectedKey={selectedKey}
                    setSelectedKey={setSelectedKey}
                />
            </HStack>

            {content}
        </VStack>
    );
};
