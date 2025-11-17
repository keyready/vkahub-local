import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';

import { User } from '../../types/User';

import { ThunkConfig } from '@/app/providers/StoreProvider/config/StateSchema';
import { objectToFormData } from '@/shared/lib/objFormdata';

type UpdatedAvatarProfile = Omit<User, 'avatar'> & {
    avatar: File | undefined;
};

export const changeUserProfile = createAsyncThunk<string, Partial<User>, ThunkConfig<string>>(
    'User/changeUserProfile',
    async (profile, thunkAPI) => {
        const { extra, rejectWithValue } = thunkAPI;

        try {
            let formdata = new FormData();

            if (profile.newAvatar) {
                const newProfile: UpdatedAvatarProfile = {
                    ...profile,
                    avatar: profile.newAvatar,
                };
                delete newProfile.newAvatar;
                formdata = objectToFormData(newProfile);
            } else {
                formdata = objectToFormData(
                    {
                        ...profile,
                        avatar: null,
                    },
                    {
                        nullValueHandling: 'stringify',
                        undefinedValueHandling: 'stringify',
                    },
                );
            }

            const response = await extra.api.post<string>('/api/user/change_profile', formdata, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

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
