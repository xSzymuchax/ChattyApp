import './ChatMessage.css'
import { useAuth } from '../../auth/AuthContext';
import { splitMessageContent } from '../../util/messageLinks';
import ChatAttachment from './ChatAttachment';

function ChatMessage({chatId, message, onLinkClick, onOpenInvitations, onDownloadRequest, onImageClick}) {
    const {userId} = useAuth();
    const senderId = message?.senderId;
    const messageContent = message?.content;
    const isMyMessage = Number(senderId) === Number(userId);
    const attachment = message?.attachment;
    const parts = splitMessageContent(attachment ? "" : messageContent);
    const showText = !attachment && Boolean(messageContent);

    return (
        <div 
        className={`chat-message ${isMyMessage ? 'own' : 'other'}${attachment?.kind === 'image' ? ' has-image' : ''}${attachment?.kind === 'file' ? ' has-file' : ''}`}>
            {attachment && (
                <ChatAttachment
                    chatId={chatId}
                    message={message}
                    onDownloadRequest={onDownloadRequest}
                    onImageClick={onImageClick}
                />
            )}
            {showText && (parts.length === 0
                ? messageContent
                : parts.map((part, index) => {
                    if (part.type === 'invite-cta') {
                        return (
                            <button
                                key={index}
                                type="button"
                                className="message-link"
                                onClick={() => onOpenInvitations?.()}
                            >
                                {part.value}
                            </button>
                        );
                    }

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
                }))}
        </div>
    )
}

export default ChatMessage
