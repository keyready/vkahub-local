import { Button, Divider } from '@nextui-org/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import { Track } from '../../model/types/Track';
import { useEventTracks } from '../../api/TracksApi';
import { registerTrackTeam } from '../../model/service/registerTrackTeam';
import { getTrackIsLoading } from '../../model/selectors/TrackSelectors';

import classes from './TrackCard.module.scss';

import { classNames } from '@/shared/lib/classNames';
import { VStack } from '@/shared/ui/Stack';
import { fetchTeam, getTeamData, useTeams } from '@/entities/Team';
import { Skeleton } from '@/shared/ui/Skeleton';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { getUserData } from '@/entities/User';
import { toastDispatch } from '@/widgets/Toaster';
import { fetchEvent } from '@/entities/Event/model/services/fetchEvent';
import { getEventData } from '@/entities/Event';

type ButtonColors = 'default' | 'success' | 'warning' | 'primary' | 'secondary' | 'danger';

interface TrackCardProps {
    className?: string;
    track: Track;
}

export const TrackCard = (props: TrackCardProps) => {
    const { className, track } = props;

    const { data: teams, isLoading, refetch: refetchTeamsData } = useTeams({ members: [1, 10] });
    const { data: allEventTracks, refetch: refetchTrackData } = useEventTracks(track.eventId);

    const dispatch = useAppDispatch();

    const userTeamData = useSelector(getTeamData);
    const userData = useSelector(getUserData);
    const isTrackLoading = useSelector(getTrackIsLoading);
    const eventData = useSelector(getEventData);

    const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);
    const [buttonColor, setButtonColor] = useState<ButtonColors>('default');

    useEffect(() => {
        if (userData?.teamId) {
            dispatch(fetchTeam(userData.teamId.toString()));
        }

        if (!eventData) {
            dispatch(fetchEvent(track.eventId.toString()));
        }
    }, [dispatch, eventData, track.eventId, userData?.teamId]);

    const renderButtonContent = useMemo(() => {
        if (!eventData?.finishDate) {
            return 'Технические неполадки...';
        }

        const today = new Date().getTime();
        const eventFinishDate = new Date(eventData?.registerUntil).getTime();

        if (!userData?.teamId || !userTeamData?.id) {
            setIsButtonDisabled(true);
            return 'Участие возможно только в команде';
        }

        if (track.participantsTeamsIds.includes(userTeamData?.id)) {
            setIsButtonDisabled(true);
            setButtonColor('success');
            return 'Вы уже зарегистрированы на этот трек';
        }

        if (allEventTracks?.some((t) => t.participantsTeamsIds?.includes(userTeamData?.id))) {
            setIsButtonDisabled(true);
            return 'Вы уже зарегистрированы на другой трек';
        }

        if (today > eventFinishDate) {
            setIsButtonDisabled(true);
            return 'Регистрация закончилась';
        }

        setIsButtonDisabled(false);
        return 'Зарегистрироваться на трек';
    }, [
        allEventTracks,
        eventData?.finishDate,
        eventData?.registerUntil,
        track.participantsTeamsIds,
        userData?.teamId,
        userTeamData?.id,
    ]);

    const calculatePopularity = useMemo(() => {
        if (!track?.participantsTeamsIds?.length) {
            return <p className="italic">зарегистрированных пока нет</p>;
        }

        if (teams?.length) {
            const totalTeams = teams.length;
            const eventTeams = track.participantsTeamsIds?.length;

            const popularity = (eventTeams / totalTeams) * 100;

            if (popularity > 75) {
                return <p className="italic text-red-400">очень высокая</p>;
            }
            if (popularity > 50) {
                return <p className="italic text-yellow-500">высокая</p>;
            }
            if (popularity > 0) {
                return <p className="italic text-yellow-500">средняя</p>;
            }

            return <p className="italic text-green-500">зарегистрированных пока нет</p>;
        }

        return <p className="italic">зарегистрированных пока нет</p>;
    }, [teams?.length, track?.participantsTeamsIds.length]);

    const handleRegisterClick = useCallback(async () => {
        if (!userTeamData?.id || !userData?.teamId) {
            toast.error('Вы не состоите в команде');
            return;
        }

        await toastDispatch(
            dispatch(
                registerTrackTeam({
                    trackId: track.id,
                    teamId: userTeamData.id,
                }),
            ),
            {
                loading: 'Регистрируем...',
                success: 'Вы успешно зарегистрировались на трек!',
                error: 'Ошибка при регистрации на трек',
            },
        );

        await dispatch(fetchTeam(userData.teamId.toString()));
        await refetchTeamsData();
        await refetchTrackData();
    }, [
        dispatch,
        track.id,
        userData?.teamId,
        userTeamData?.id,
        refetchTeamsData,
        refetchTrackData,
    ]);

    return (
        <VStack
            className={classNames(classes.TrackCard, {}, [className])}
            align="start"
            justify="between"
            maxW
            gap="12px"
        >
            <VStack maxW>
                <h1 className="text-left font-bold text-l text-primary">{track.title}</h1>
                <p className="indent-5 text-left text-primary">{track.description}</p>
            </VStack>
            <VStack maxW>
                <Divider />
                <p className="text-left text-primary">
                    Популярность трека:{' '}
                    {isLoading ? <Skeleton width="20px" height="20px" /> : calculatePopularity}
                </p>
                <Divider />
                <Button
                    onClick={handleRegisterClick}
                    className="self-end mt-5 text-wrap"
                    color={buttonColor}
                    isDisabled={isButtonDisabled || isTrackLoading}
                >
                    {renderButtonContent}
                </Button>
            </VStack>
        </VStack>
    );
};
