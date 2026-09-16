import { useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { playIncomingMessageSound } from "../util/messageSound";
import { useSocket } from "./WebSocketContext";

export function useIncomingMessageSound() {
    const { userId } = useAuth();
    const { subscribeToMessages } = useSocket();

    useEffect(() => {
        const unsubscribe = subscribeToMessages((payload) => {
            if (payload.type !== "message") {
                return;
            }

            if (Number(payload.message?.senderId) === Number(userId)) {
                return;
            }

            playIncomingMessageSound();
        });

        return unsubscribe;
    }, [subscribeToMessages, userId]);
}
