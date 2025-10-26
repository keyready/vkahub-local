import { useSelector } from 'react-redux';

import { useTeams } from '../../api/fetchTeamsApi';
import { TeamCard } from '../TeamCard/TeamCard';
import { DisplayVariant } from '../TeamsDisplaySelector/TeamsDisplaySelector';
import { getTeamsFilters } from '../../model/selectors/TeamSelectors';

import classes from './TeamsList.module.scss';

import { classNames, Mods } from '@/shared/lib/classNames';
import { VStack } from '@/shared/ui/Stack';

interface TeamsListProps {
    className?: string;
    displayVariant?: DisplayVariant;
}

export const TeamsList = (props: TeamsListProps) => {
    const { className, displayVariant = 'compact' } = props;

    const filters = useSelector(getTeamsFilters);

    const {
        data: teams,
        isLoading: isTeamsLoading,
        isFetching: isTeamsFetching,
    } = useTeams(filters);

    const mods: Mods = {
        [classes.grid]: displayVariant === 'compact',
        [classes.flex]: displayVariant === 'detailed',
    };

    if (isTeamsLoading || isTeamsFetching) {
        return (
            <VStack className={classNames('', mods)} maxW>
                {new Array(10).fill(0).map((_, index) => (
                    <TeamCard key={index} isLoading />
                ))}
            </VStack>
        );
    }

    if (!isTeamsLoading && !teams?.length) {
        return (
            <VStack
                align="center"
                justify="center"
                className="w-full h-[78%] rounded-xl bg-card-bg shadow-xl flex-grow mt-5"
            >
                <h1 className="text-m md:text-l text-main italic text-center">
                    {filters
                        ? 'По заданным параметрам ничего не найдено'
                        : 'Пока нет ни одной команды'}
                </h1>
            </VStack>
        );
    }

    return (
        <div className={classNames(classes.TeamsList, mods, [className])}>
            {teams?.map((team, index) => (
                <TeamCard key={index} displayVariant={displayVariant} team={team} />
            ))}
        </div>
    );
};
