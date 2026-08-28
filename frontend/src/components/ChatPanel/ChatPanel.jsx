import { useEffect, useState } from 'react';
import ChatContent from './ChatContent';
import './ChatPanel.css'

import CurrentChatHeader from './CurrentChatHeader'
import MessageSender from './MessageSender';
import { getUserById } from '../../api/user';
import { getChat } from '../../api/chat';
import { useAuth } from '../../auth/AuthContext';


function ChatPanel({chatId}) {
    const { userId } = useAuth();
    const [otherUser, setOtherUser] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);

    useEffect(() => {
        // const getOtherUser = async () => {
        //     try {
        //         const response1 = await getChat(chatId);
        //         const otherId = response1.data.

        //         const response2 = await getUserById()
        //     } catch (error) {

        //     }
        // }
    },[chatId, otherUser])
    
    return(
        <div className="chat-panel">
            <CurrentChatHeader username={otherUser.username}/>
            <ChatContent content={chatMessages}/>
            <MessageSender />
        </div>
    );
}

export default ChatPanel