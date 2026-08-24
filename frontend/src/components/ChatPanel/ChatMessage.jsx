import { useEffect, useState } from 'react'
import './ChatMessage.css'

function ChatMessage({sender_id}) {
    const [isMyMessage, setIsMyMessage] = useState(false);

    //TODO - change 1 into user id
    useEffect(() => {
        setIsMyMessage(sender_id === 1);
    }, [sender_id])

    return (
        <div 
        className={`chat-message ${(isMyMessage == true) ? 'own' : 'other'}`}>
            RANDOM MESSAGE! With some text in it!
        </div>
    )
}

export default ChatMessage