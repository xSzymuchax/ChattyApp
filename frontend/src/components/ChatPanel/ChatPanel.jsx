import { useCallback, useEffect, useRef, useState } from 'react';
import ChatContent from './ChatContent';
import './ChatPanel.css'

import CurrentChatHeader from './CurrentChatHeader'
import MessageSender from './MessageSender';
import EmojiPicker from './EmojiPicker';
import { getUserById } from '../../api/user';
import { getChat, getMessagesFromChat, uploadChatAttachment } from '../../api/chat';
import AttachmentButton from './AttachmentButton';
import { useAuth } from '../../auth/AuthContext';
import { useSocket } from '../../websocket/WebSocketContext';

const PAGE_SIZE = 20;

function ChatPanel({chatId, onOpenGames, onOpenInvitations, onOpponentChange, onChatActivity, sentChatMessage}) {
    const { userId } = useAuth();
    const [otherUser, setOtherUser] = useState({});
    const [chatMessages, setChatMessages] = useState([]);
    const [hasMore, setHasMore] = useState(false);
    const [isLoadingOlder, setIsLoadingOlder] = useState(false);
    const [loadedChatId, setLoadedChatId] = useState(null);
    const [scrollToBottomToken, setScrollToBottomToken] = useState(0);
    const [attachError, setAttachError] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const historyCountRef = useRef(0);
    const loadingOlderRef = useRef(false);
    const lastSentChatMessageRef = useRef(null);
    const messageSenderRef = useRef(null);
    const {subscribeToMessages} = useSocket();

    useEffect(() => {
        const loadOtherUser = async () => {
            if (!chatId || !userId) {
                setOtherUser({});
                return;
            }

            try {
                const chatResponse = await getChat(chatId);
                const chat = chatResponse.data;
                const otherUserId =
                    Number(chat.firstUserId) === Number(userId)
                        ? chat.secondUserId
                        : chat.firstUserId;

                const userResponse = await getUserById(otherUserId);
                setOtherUser(userResponse.data);
            } catch (error) {
                console.log(error);
                setOtherUser({});
            }
        };

        loadOtherUser();
    }, [chatId, userId]);

    useEffect(() => {
        if (!onOpponentChange)
            return;

        onOpponentChange(otherUser.id ? otherUser : null);
    }, [otherUser, onOpponentChange]);

    useEffect(() => {
        let cancelled = false;
        historyCountRef.current = 0;
        loadingOlderRef.current = false;
        setHasMore(false);
        setIsLoadingOlder(false);
        setLoadedChatId(null);
        setScrollToBottomToken(0);
        setAttachError("");
        setIsUploading(false);
        setChatMessages([]);

        if (!chatId) {
            return;
        }

        const loadLatest = async () => {
            try {
                const response = await getMessagesFromChat(chatId, 0, PAGE_SIZE);
                if (cancelled) {
                    return;
                }

                const batch = Array.isArray(response.data) ? response.data : [];
                historyCountRef.current = batch.length;
                setHasMore(batch.length === PAGE_SIZE);
                setLoadedChatId(chatId);
                setChatMessages(batch);
            } catch (error) {
                console.log(error);
            }
        };

        loadLatest();

        return () => {
            cancelled = true;
        };
    },[chatId])

    const loadOlderMessages = useCallback(async () => {
        if (!chatId || loadingOlderRef.current || !hasMore) {
            return;
        }

        loadingOlderRef.current = true;
        setIsLoadingOlder(true);
        const start = historyCountRef.current;

        try {
            const response = await getMessagesFromChat(chatId, start, start + PAGE_SIZE);
            const batch = Array.isArray(response.data) ? response.data : [];
            historyCountRef.current += batch.length;
            setHasMore(batch.length === PAGE_SIZE);
            setChatMessages((prev) => {
                const existingIds = new Set(prev.map((message) => message.id));
                return [
                    ...batch.filter((message) => !existingIds.has(message.id)),
                    ...prev,
                ];
            });
        } catch (error) {
            console.log(error);
        } finally {
            loadingOlderRef.current = false;
            setIsLoadingOlder(false);
        }
    }, [chatId, hasMore]);

    useEffect(() => {
        const unsubscribe = subscribeToMessages((message) => {
            if (message.type !== "message") {
                return;
            }

            const newMessage = message.message;

            if (Number(newMessage.chatId) !== Number(chatId)) {
                return;
            }

            historyCountRef.current += 1;
            setChatMessages(prev => [
                ...prev,
                newMessage
            ]);
            setScrollToBottomToken((token) => token + 1);
        });

        return unsubscribe;
    }, [subscribeToMessages, chatId]);

    const addMessage = (message) => {
        setChatMessages((prev) => [
            ...prev,
            message
        ]);
        setScrollToBottomToken((token) => token + 1);
        onChatActivity?.(message);
    }

    const handleAttachFile = async (file, errorMessage) => {
        if (errorMessage) {
            setAttachError(errorMessage);
            return;
        }

        if (!file || !chatId) {
            return;
        }

        setAttachError("");
        setIsUploading(true);

        try {
            const response = await uploadChatAttachment(chatId, file);
            addMessage(response.data.message);
        } catch (error) {
            console.log(error);
            setAttachError("Could not send attachment.");
        } finally {
            setIsUploading(false);
        }
    }

    useEffect(() => {
        if (!sentChatMessage || sentChatMessage === lastSentChatMessageRef.current) {
            return;
        }

        lastSentChatMessageRef.current = sentChatMessage;

        if (Number(sentChatMessage.chatId) !== Number(chatId)) {
            return;
        }

        addMessage(sentChatMessage);
    }, [sentChatMessage, chatId]);
    
    return(
        <div className="chat-panel">
            <CurrentChatHeader
                chatName={otherUser.username}
                userId={otherUser.id}
                hasAvatar={otherUser.hasAvatar}
                version={otherUser.updatedAt}
            />
            <ChatContent
                key={chatId}
                chatId={chatId}
                chatMessages={Number(loadedChatId) === Number(chatId) ? chatMessages : []}
                hasMore={hasMore}
                isLoadingOlder={isLoadingOlder}
                scrollToBottomToken={scrollToBottomToken}
                onLoadOlder={loadOlderMessages}
                onOpenInvitations={onOpenInvitations}
            />
            <div className="chat-composer">
                <button
                    type="button"
                    className="open-games-button"
                    aria-label="Open games"
                    onClick={onOpenGames}
                >
                    <i className="icon-gamepad"></i>
                </button>
                <EmojiPicker
                    onSelect={(emoji) => messageSenderRef.current?.insertText(emoji)}
                />
                <AttachmentButton
                    disabled={!chatId || isUploading}
                    onSelect={handleAttachFile}
                />
                {attachError && <p className="composer-error">{attachError}</p>}
                <MessageSender
                    ref={messageSenderRef}
                    chatId={chatId}
                    onMessageSend={addMessage}
                />
            </div>
            
        </div>
    );
}

export default ChatPanel