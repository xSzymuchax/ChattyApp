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
        className='chat-message'
        style={{
            "--margin-left-value": `${isMyMessage ? 'auto' : '10px'}`,
            "--margin-right-value": `${isMyMessage ? '10px' : 'auto'}`,
        }}>
            RANDOM MESSAGE! YEYEYE
            aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa aaaaaaaaaaa aaaaaaaaaaaaaaaa 
        </div>
    )
}

export default ChatMessage