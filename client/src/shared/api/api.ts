import axios from 'axios';

import { USER_ACCESS_TOKEN, USER_REFRESH_TOKEN } from '@/shared/const';
import { Tokens } from '@/entities/User';

axios.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';

export const $api = axios.create({
    baseURL: '',
});

$api.interceptors.request.use((config) => {
    if (config.headers) {
        const token = localStorage.getItem(USER_ACCESS_TOKEN);

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }

    return config;
});

async function refreshTokens(): Promise<any> {
    try {
        const refreshToken = localStorage.getItem(USER_REFRESH_TOKEN);

        const response = await axios.post<Tokens>('/api/auth/refresh_token', undefined, {
            headers: {
                Authorization: `Bearer ${refreshToken}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка при обновлении токена:', error);
        throw error;
    }
}

$api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const { access_token, refresh_token } = await refreshTokens();

                $api.defaults.headers.common.Authorization = `Bearer ${access_token}`;

                localStorage.setItem(USER_ACCESS_TOKEN, access_token);
                localStorage.setItem(USER_REFRESH_TOKEN, refresh_token);

                return $api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem(USER_ACCESS_TOKEN);
                localStorage.removeItem(USER_REFRESH_TOKEN);
                throw refreshError;
            }
        }

        throw error;
    },
);
