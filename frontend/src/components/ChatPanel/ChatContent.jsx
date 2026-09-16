import { useLayoutEffect, useRef, useState } from 'react';
import './ChatContent.css'
import ChatMessage from './ChatMessage'
import LinkWarningModal from './LinkWarningModal';
import { toSafeHttpUrl } from '../../util/messageLinks';

function ChatContent({chatMessages = []}) {
    const contentRef = useRef(null);
    const [pendingLink, setPendingLink] = useState(null);

    useLayoutEffect(() => {
        const content = contentRef.current;
        if (!content) return;

        content.scrollTop = content.scrollHeight;
    }, [chatMessages]);

    const handleLinkClick = (rawLink) => {
        const safeUrl = toSafeHttpUrl(rawLink);

        if (!safeUrl) {
            return;
        }

        setPendingLink(safeUrl);
    };

    const handleCancelLink = () => {
        setPendingLink(null);
    };

    const handleConfirmLink = () => {
        if (pendingLink) {
            window.open(pendingLink, '_blank', 'noopener,noreferrer');
        }

        setPendingLink(null);
    };

    return(
        <div className='chat-content' ref={contentRef}>
            {chatMessages.map((x) => (
                <ChatMessage 
                    key={x.id}
                    sender_id={x.senderId}
                    messageContent={x.content}
                    onLinkClick={handleLinkClick}>
                </ChatMessage>)
            )}
            <LinkWarningModal
                url={pendingLink}
                onConfirm={handleConfirmLink}
                onCancel={handleCancelLink}
            />
        </div>
    );
}

export default ChatContent
