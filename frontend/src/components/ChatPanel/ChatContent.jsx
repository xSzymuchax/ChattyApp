import { useLayoutEffect, useRef } from 'react';
import './ChatContent.css'
import ChatMessage from './ChatMessage'

function ChatContent({chatMessages = []}) {
    const contentRef = useRef(null);

    useLayoutEffect(() => {
        const content = contentRef.current;
        if (!content) return;

        content.scrollTop = content.scrollHeight;
    }, [chatMessages]);

    return(
        <div className='chat-content' ref={contentRef}>
            {chatMessages.map((x) => (
                <ChatMessage 
                    key={x.id}
                    sender_id={x.senderId}
                    messageContent={x.content}>
                </ChatMessage>)
            )}
        </div>
    );
}

export default ChatContent
