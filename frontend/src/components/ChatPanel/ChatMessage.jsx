import { useEffect, useState } from 'react'
import './ChatMessage.css'
import { useAuth } from '../../auth/AuthContext';

function ChatMessage({sender_id, messageContent}) {
    const [isMyMessage, setIsMyMessage] = useState(false);
    const {userId} = useAuth();

    //TODO - change 1 into user id
    useEffect(() => {
        setIsMyMessage(sender_id === userId);
    }, [sender_id])

    return (
        <div 
        className={`chat-message ${(isMyMessage == true) ? 'own' : 'other'}`}>
            {messageContent}
        </div>
    )
}

export default ChatMessage