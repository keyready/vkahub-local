import React, { FormEvent, useCallback, useState } from 'react';
import { Autocomplete, AutocompleteItem, Button, Input, Textarea } from '@nextui-org/react';

import { Track } from '../../model/types/Track';

import { classNames } from '@/shared/lib/classNames';
import { VStack } from '@/shared/ui/Stack';
import { useEvents } from '@/entities/Event/api/fetchEventsApi';
import { useAppDispatch } from '@/shared/lib/hooks/useAppDispatch';
import { toastDispatch } from '@/widgets/Toaster';
import { createTrack } from '@/entities/Track';

interface CreateTrackFormProps {
    className?: string;
}

export const CreateTrackForm = (props: CreateTrackFormProps) => {
    const { className } = props;

    const [newTrack, setNewTrack] = useState<Partial<Track>>({});

    const dispatch = useAppDispatch();

    const { data: events, isLoading } = useEvents('all');

    const handleFormSubmit = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            await toastDispatch(dispatch(createTrack(newTrack)));
        },
        [dispatch, newTrack],
    );

    return (
        <VStack gap="24px" maxW className={classNames('', {}, [className])}>
            <h1 className="text-l">Добавление трека на соревнование</h1>

            <form onSubmit={handleFormSubmit}>
                <VStack maxW gap="12px">
                    <Input
                        value={newTrack.title}
                        onChange={(event) =>
                            setNewTrack({ ...newTrack, title: event.target.value })
                        }
                        label="Название трека"
                    />
                    <Textarea
                        classNames={{
                            inputWrapper: 'h-auto',
                        }}
                        minRows={4}
                        value={newTrack.description}
                        onChange={(event) =>
                            setNewTrack({
                                ...newTrack,
                                description: event.target.value,
                            })
                        }
                        label="Описание трека"
                    />
                    <Autocomplete
                        isLoading={isLoading}
                        label="К какому ивенту прикрепить"
                        items={events}
                        defaultItems={[]}
                        listboxProps={{
                            emptyContent: 'Нет доступных соревнований',
                        }}
                        value={newTrack.eventId}
                        onSelectionChange={(event) =>
                            setNewTrack({
                                ...newTrack,
                                eventId: Number(event),
                            })
                        }
                    >
                        {(event) => (
                            <AutocompleteItem className="text-primary" key={event.id}>
                                {event.title}
                            </AutocompleteItem>
                        )}
                    </Autocomplete>

                    <Button className="self-end" type="submit">
                        Создать
                    </Button>
                </VStack>
            </form>
        </VStack>
    );
};
