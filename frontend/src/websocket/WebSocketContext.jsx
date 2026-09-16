import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    useCallback
} from "react";

import { isTokenValid, useAuth } from "../auth/AuthContext";
import { realtimeSocketUrl } from "../config/endpoints";

const WebSocketContext = createContext(null);
const MAX_RECONNECT_DELAY_MS = 30000;
const AUTH_FAILURE_CLOSE_CODE = 4001;

export function WebSocketProvider({ children }) {
    const { token, userId, logout } = useAuth();
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

        if (!isTokenValid(currentToken)) {
            shouldReconnectRef.current = false;
            clearReconnectTimeout();

            if (currentToken) {
                logout();
            }

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
            let message;

            try {
                message = JSON.parse(event.data);
            } catch (error) {
                console.error("WebSocket message parse error:", error);
                return;
            }

            console.log("WebSocket message:", message.type);

            listenersRef.current.forEach((listener) => {
                listener(message);
            });
        };

        newSocket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        newSocket.onclose = (event) => {
            console.log("WebSocket disconnected");

            if (socketRef.current === newSocket) {
                socketRef.current = null;
                setSocket(null);
            }

            if (event.code === AUTH_FAILURE_CLOSE_CODE) {
                shouldReconnectRef.current = false;
                clearReconnectTimeout();
                logout();
                return;
            }

            if (!shouldReconnectRef.current || !isTokenValid(tokenRef.current)) {
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
    }, [logout]);

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
    }, [userId, connect]);

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
