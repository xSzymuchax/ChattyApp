import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    useCallback
} from "react";

import { useAuth } from "../auth/AuthContext";
import { realtimeSocketUrl } from "../config/endpoints";

const WebSocketContext = createContext(null);
const MAX_RECONNECT_DELAY_MS = 30000;

export function WebSocketProvider({ children }) {
    const { token } = useAuth();
    const [socket, setSocket] = useState(null);
    const socketRef = useRef(null);
    const listenersRef = useRef(new Set());
    const tokenRef = useRef(token);
    const reconnectTimeoutRef = useRef(null);
    const reconnectAttemptRef = useRef(0);
    const shouldReconnectRef = useRef(false);

    tokenRef.current = token;

    const clearReconnectTimeout = () => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
    };

    const connect = useCallback(() => {
        const currentToken = tokenRef.current;

        if (!currentToken) {
            return;
        }

        const existingSocket = socketRef.current;
        if (
            existingSocket &&
            (existingSocket.readyState === WebSocket.OPEN ||
                existingSocket.readyState === WebSocket.CONNECTING)
        ) {
            return;
        }

        const newSocket = new WebSocket(realtimeSocketUrl());

        socketRef.current = newSocket;

        newSocket.onopen = () => {
            console.log("WebSocket connected");
            reconnectAttemptRef.current = 0;

            newSocket.send(
                JSON.stringify({
                    type: "auth",
                    token: tokenRef.current
                })
            );

            setSocket(newSocket);
        };

        newSocket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            console.log("WebSocket message:", message.type);

            listenersRef.current.forEach((listener) => {
                listener(message);
            });
        };

        newSocket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        newSocket.onclose = () => {
            console.log("WebSocket disconnected");

            if (socketRef.current === newSocket) {
                socketRef.current = null;
                setSocket(null);
            }

            if (!shouldReconnectRef.current || !tokenRef.current) {
                return;
            }

            const delay = Math.min(
                1000 * 2 ** reconnectAttemptRef.current,
                MAX_RECONNECT_DELAY_MS
            );
            reconnectAttemptRef.current += 1;

            reconnectTimeoutRef.current = setTimeout(() => {
                connect();
            }, delay);
        };
    }, []);

    useEffect(() => {
        shouldReconnectRef.current = Boolean(token);
        clearReconnectTimeout();

        if (!token) {
            reconnectAttemptRef.current = 0;

            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }

            setSocket(null);
            return;
        }

        connect();

        return () => {
            shouldReconnectRef.current = false;
            clearReconnectTimeout();

            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [token, connect]);

    const subscribeToMessages = useCallback((listener) => {
        listenersRef.current.add(listener);

        return () => {
            listenersRef.current.delete(listener);
        };
    }, []);

    return (
        <WebSocketContext.Provider
            value={{
                socket,
                subscribeToMessages
            }}
        >
            {children}
        </WebSocketContext.Provider>
    );
}

export function useSocket() {
    const context = useContext(WebSocketContext);

    if (!context) {
        throw new Error(
            "useSocket must be used inside WebSocketProvider"
        );
    }

    return context;
}
