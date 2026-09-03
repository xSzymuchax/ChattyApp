import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    useCallback
} from "react";

import { useAuth } from "../auth/AuthContext";

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
    const { token } = useAuth();
    const [socket, setSocket] = useState(null);
    const socketRef = useRef(null);
    const listenersRef = useRef(new Set());

    useEffect(() => {
        if (!token) {
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }

            setSocket(null);
            return;
        }

        if (socketRef.current) {
            return;
        }

        const newSocket = new WebSocket(
            import.meta.env.VITE_RT_API_URL
        );

        socketRef.current = newSocket;

        newSocket.onopen = () => {
            console.log("WebSocket connected");

            newSocket.send(
                JSON.stringify({
                    type: "auth",
                    token: token
                })
            );
        };

        newSocket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            console.log("WebSocket message:", message);

            // Przekazujemy wiadomość wszystkim listenerom
            listenersRef.current.forEach((listener) => {
                listener(message);
            });
        };

        newSocket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        newSocket.onclose = () => {
            console.log("WebSocket disconnected");

            socketRef.current = null;
            setSocket(null);
        };

        setSocket(newSocket);

        return () => {
            newSocket.close();

            if (socketRef.current === newSocket) {
                socketRef.current = null;
            }
        };
    }, [token]);

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