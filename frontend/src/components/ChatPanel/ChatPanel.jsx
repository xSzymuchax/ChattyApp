import { useEffect, useState } from 'react';
import ChatContent from './ChatContent';
import './ChatPanel.css'

import CurrentChatHeader from './CurrentChatHeader'
import MessageSender from './MessageSender';
import { getUserById } from '../../api/user';
import { getChat, getMessagesFromChat } from '../../api/chat';
import { useAuth } from '../../auth/AuthContext';
import { useSocket } from '../../websocket/WebSocketContext';


function ChatPanel({chatId}) {
    const { userId } = useAuth();
    const [otherUser, setOtherUser] = useState({});
    const [chatMessages, setChatMessages] = useState([]);
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
        const getMessages = async () => {
            try {
                if (!chatId)
                    return;

                const response = await getMessagesFromChat(chatId, 1, 10);
                console.log(response);
                setChatMessages(response.data);
            } catch (error) {
                console.log(error);
            }
        }

        getMessages();
    },[chatId])

    useEffect(() => {
        const unsubscribe = subscribeToMessages((message) => {
            console.log("ChatPanel received:", message);

            if (message.type !== "message") {
                return;
            }

            const newMessage = message.message;

            if (newMessage.chatId !== chatId) {
                return;
            }

            setChatMessages(prev => [
                ...prev,
                newMessage
            ]);
        });

        return unsubscribe;
    }, [subscribeToMessages, chatId]);

    const addMessage = (message) => {
        setChatMessages((prev) => [
            ...prev,
            message
        ]);
    }
    
    return(
        <div className="chat-panel">
            <CurrentChatHeader chatName={otherUser.username}/>
            <ChatContent chatMessages={chatMessages}/>
            <MessageSender chatId={chatId} onMessageSend={addMessage}/>
        </div>
    );
}

export default ChatPanel