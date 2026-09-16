import { useEffect, useState } from 'react'
import './ChatMessage.css'
import { useAuth } from '../../auth/AuthContext';
import { splitMessageLinks } from '../../util/messageLinks';

function ChatMessage({sender_id, messageContent, onLinkClick}) {
    const [isMyMessage, setIsMyMessage] = useState(false);
    const {userId} = useAuth();

    useEffect(() => {
        setIsMyMessage(Number(sender_id) === Number(userId));
    }, [sender_id, userId]);

    const parts = splitMessageLinks(messageContent);

    return (
        <div 
        className={`chat-message ${(isMyMessage == true) ? 'own' : 'other'}`}>
            {parts.length === 0
                ? messageContent
                : parts.map((part, index) => {
                    if (part.type !== 'link') {
                        return <span key={index}>{part.value}</span>;
                    }

                    return (
                        <button
                            key={index}
                            type="button"
                            className="message-link"
                            onClick={() => onLinkClick?.(part.value)}
                        >
                            {part.value}
                        </button>
                    );
                })}
        </div>
    )
}

export default ChatMessage
