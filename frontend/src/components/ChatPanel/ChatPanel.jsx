import { useEffect, useState } from 'react';
import ChatContent from './ChatContent';
import './ChatPanel.css'

import CurrentChatHeader from './CurrentChatHeader'
import MessageSender from './MessageSender';
import { getUserById } from '../../api/user';
import { getChat, getMessagesFromChat } from '../../api/chat';
import { useAuth } from '../../auth/AuthContext';


function ChatPanel({chatId}) {
    const { userId } = useAuth();
    const [otherUser, setOtherUser] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);

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
    
    return(
        <div className="chat-panel">
            <CurrentChatHeader username={otherUser.username}/>
            <ChatContent chatMessages={chatMessages}/>
            <MessageSender />
        </div>
    );
}

export default ChatPanel