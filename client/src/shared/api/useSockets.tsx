import { useCallback, useEffect, useMemo } from 'react';
import useWebSocket, { Options } from 'react-use-websocket';

const baseUrl = '/online';

export function useSockets<T, M = any>(url?: string) {
    const socketUrl = `/ws${url || baseUrl}`;

    const options = useMemo<Options>(
        () => ({
            share: true,
            onOpen: () => console.log('[WS] Open'),
            onClose: (e) => console.log(`[WS] Close: ${e.code}`),
        }),
        [],
    );

    const {
        sendMessage: rawSend,
        lastMessage,
        readyState,
        getWebSocket,
    } = useWebSocket(socketUrl, options);

    useEffect(
        () => () => {
            getWebSocket()?.close(1000, 'User initiated close');
        },
        [getWebSocket],
    );

    const data = lastMessage ? lastMessage.data : undefined;

    const sendMessage = useCallback(
        (message: Partial<M>) => {
            if (readyState === WebSocket.OPEN) {
                rawSend(JSON.stringify(message));
            } else {
                console.warn('[useSockets] Message dropped: not OPEN', readyState);
            }
        },
        [rawSend, readyState],
    );

    return {
        data,
        sendMessage,
    };
}
