import './ChatMessage.css'
import { useAuth } from '../../auth/AuthContext';
import { splitMessageContent } from '../../util/messageLinks';
import ChatAttachment from './ChatAttachment';
import UserAvatar from '../UserAvatar';

function ChatMessage({chatId, message, isMyMessage, onLinkClick, onOpenInvitations, onDownloadRequest, onImageClick}) {
    const messageContent = message?.content;
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

function ChatMessageGroup({chatId, messages, sender, onLinkClick, onOpenInvitations, onDownloadRequest, onImageClick}) {
    const {userId} = useAuth();
    const senderId = messages[0]?.senderId;
    const isMyMessage = Number(senderId) === Number(userId);
    const senderName = sender?.username || "";

    return (
        <div className={`chat-message-group ${isMyMessage ? 'own' : 'other'}`}>
            <div className="chat-message-group-body">
                {!isMyMessage && (
                    <div className="chat-message-avatar">
                        <UserAvatar
                            userId={senderId}
                            username={senderName}
                            hasAvatar={sender?.hasAvatar}
                            version={sender?.updatedAt}
                        />
                    </div>
                )}
                <div className="chat-message-column">
                    <div className="chat-message-author">{senderName}</div>
                    <div className="chat-message-stack">
                        {messages.map((message) => (
                            <ChatMessage
                                key={message.id}
                                chatId={chatId}
                                message={message}
                                isMyMessage={isMyMessage}
                                onLinkClick={onLinkClick}
                                onOpenInvitations={onOpenInvitations}
                                onDownloadRequest={onDownloadRequest}
                                onImageClick={onImageClick}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function groupMessagesBySender(messages) {
    const groups = [];

    for (const message of messages) {
        const senderId = Number(message?.senderId);
        const last = groups[groups.length - 1];

        if (last && last.senderId === senderId) {
            last.messages.push(message);
            continue;
        }

        groups.push({ senderId, messages: [message] });
    }

    return groups;
}

export default ChatMessageGroup
