import { useCallback, useEffect, useMemo } from 'react';
import useWebSocket, { Options } from 'react-use-websocket';

const baseUrl = '/online';

export function useSockets<T, M = any>(url?: string) {
    const socketUrl = `ws://localhost:5000/ws${url || baseUrl}`;

    // ✅ useMemo — критически важен!
    const options = useMemo<Options>(
        () => ({
            share: true, // ← каждый вызов — отдельное соединение (как у тебя было)
            // reconnect: false, // опционально: отключить авто-повтор
            onOpen: () => console.log('[WS] Open'),
            onClose: (e) => console.log(`[WS] Close: ${e.code}`),
        }),
        [], // ← пустые зависимости!
    );

    const {
        sendMessage: rawSend,
        lastMessage,
        readyState,
        getWebSocket,
    } = useWebSocket(
        socketUrl,
        options,
        // ⚠️ Третий параметр (`connect`) НЕ передаём → always connected while mounted
    );

    useEffect(
        () => () => {
            getWebSocket()?.close(1000, 'User initiated close'); // Optional: provide a code and reason
        },
        [getWebSocket],
    );

    // Повторно парсим lastMessage.data → T
    const data = lastMessage ? lastMessage.data : undefined;

    // sendMessage — как раньше: Partial<M> → JSON.stringify
    const sendMessage = useCallback(
        (message: Partial<M>) => {
            if (readyState === WebSocket.OPEN) {
                rawSend(JSON.stringify(message));
            } else {
                // Можно опционально буферизировать или игнорировать
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
