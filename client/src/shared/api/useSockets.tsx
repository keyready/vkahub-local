import { useCallback, useEffect, useMemo, useState } from 'react';

const baseUrl = '/online';

export function useSockets<T, M = any>(url?: string) {
    const ws = useMemo(() => new WebSocket(`ws://localhost:5000/ws${url || baseUrl}`), [url]);

    const [socketData, setSocketData] = useState<T>();
    const [error, setError] = useState<any>();

    const sendMessage = useCallback(
        (data: Partial<M>) => {
            ws.send(JSON.stringify(data));
        },
        [ws],
    );

    useEffect(() => {
        ws.onopen = () => {
            console.log('Сокеты подключились');
        };

        ws.onmessage = (event) => {
            setSocketData(event.data);
        };

        ws.onerror = (error) => {
            console.log('sockets error', error);
            setError(error);
        };

        return () => {
            ws.close();
        };
    }, [ws]);

    return {
        data: socketData,
        sendMessage,
        error,
    };
}
