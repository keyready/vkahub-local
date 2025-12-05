import { useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';

import { UserCard } from '../UserCard/UserCard';
import { useUsers } from '../../api/fetchAllUsersApi';
import { getMembersFilters } from '../../model/selectors/UserSelectors';

import classes from './UsersList.module.scss';

import { Skeleton } from '@/shared/ui/Skeleton';
import { classNames } from '@/shared/lib/classNames';
import { VStack } from '@/shared/ui/Stack';

interface UsersListProps {
    className?: string;
}

export const UsersList = (props: UsersListProps) => {
    const { className } = props;

    const filters = useSelector(getMembersFilters);

    const { data: users, isLoading } = useUsers(filters, {
        refetchOnMountOrArgChange: true,
    });

    if (isLoading) {
        return (
            <VStack gap="8px" maxW className={classNames(classes.UsersList, {}, [className])}>
                {new Array(8).fill(0).map((_, index) => (
                    <Skeleton width="100%" height="40px" key={index} />
                ))}
            </VStack>
        );
    }

    if (!users?.length && !isLoading) {
        return (
            <VStack
                flexGrow
                gap="8px"
                maxW
                className={classNames('bg-card-bg shadow-xl rounded-xl p-5', {}, [className])}
            >
                <h1 className="w-full text-center text-m font-bold">
                    По заданным фильтрам никого не найдено
                </h1>
                <h1 className="opacity-60 w-full text-center text-m">Измените условия поиска</h1>
            </VStack>
        );
    }

    return (
        <VStack gap="8px" maxW className={classNames(classes.UsersList, {}, [className])}>
            <AnimatePresence mode="wait">
                {users?.map((user, index) => (
                    <motion.div
                        key={index}
                        initial={{ x: 0, opacity: 0 }}
                        exit={{ x: 0, opacity: 0 }}
                        animate={{ x: 1, opacity: 1 }}
                        className="w-full"
                    >
                        <UserCard user={user} key={user.id} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </VStack>
    );
};
