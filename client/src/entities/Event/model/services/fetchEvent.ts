import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

import { Event } from '../types/Event';

import { ThunkConfig } from '@/app/providers/StoreProvider/config/StateSchema';

export const fetchEvent = createAsyncThunk<Event, string, ThunkConfig<string>>(
    'Event/fetchEvent',
    async (eventId, thunkAPI) => {
        const { extra, rejectWithValue } = thunkAPI;

        try {
            const response = await extra.api.get<Event>(`/api/events/event?eventId=${eventId}`);
            //
            // const response: { data: Event } = {
            //     data: {
            //         id: 1,
            //         title: 'Поел говна, поешь и палки',
            //         description:
            //             'Описание мероприятия, может быть очень большое, потому что никто не запрещает так делать, да и юай поддерживает',
            //         shortDescription: 'А это очень короткое описание',
            //         sponsors: ['Кафедра', 'Сбора', 'и', 'обработки', 'информации'],
            //         image: 'string',
            //         type: 'hack',
            //         startDate: addDays(new Date(), 10),
            //         finishDate: addDays(new Date(), 17),
            //         registerUntil: addDays(new Date(), 8),
            //     },
            // };

            if (!response.data) {
                throw new Error();
            }

            return response.data;
        } catch (e) {
            const axiosError = e as AxiosError;
            // @ts-ignore
            return rejectWithValue(axiosError.response?.data?.message || 'Произошла ошибка');
        }
    },
);
