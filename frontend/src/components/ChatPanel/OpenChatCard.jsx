import { useEffect, useState } from 'react';
import './OpenChatCard.css'
import { getUserById } from '../../api/user';
import { useAuth } from '../../auth/AuthContext';
import { formatLastMessageTime } from '../../util/chatList';
import UserAvatar from '../UserAvatar';

function OpenChatCard({chatData, unread = false, onChatSelected}) {
    const [chatWithUser, setChatWithUser] = useState({});
    const {userId} = useAuth();
    const isGroup = Boolean(chatData?.name);
    const otherUserId = isGroup
        ? null
        : (chatData?.memberIds ?? []).map(Number).find((id) => id !== Number(userId));
    
    useEffect(() => {
        const getUser = async () => {
            if (!otherUserId) {
                setChatWithUser({});
                return;
            }

            try {
                const response = await getUserById(otherUserId);
                setChatWithUser(response.data);

            } catch (error) {
                console.log(error);
            }
        };

        if (chatData?.id && userId)
            getUser();

        
    }, [chatData?.id, otherUserId, userId]);

    const lastMessageContent = chatData.lastMessageContent;
    const lastMessageSenderId = Number(chatData.lastMessageSenderId);
    const lastMessageTime = formatLastMessageTime(chatData.lastMessageCreatedAt);
    const title = isGroup ? chatData.name : chatWithUser.username;
    const senderLabel =
        lastMessageSenderId === Number(userId)
            ? 'You'
            : (isGroup ? '' : chatWithUser.username);

    const handleClick = () => {
        onChatSelected(chatData.id);
    };
    
    return (
        <div
            className={`open-chat-card${unread ? ' unread' : ''}`}
            onClick={handleClick}
        >
            <div className="profile-picture">
                <UserAvatar
                    userId={isGroup ? undefined : chatWithUser.id}
                    username={title}
                    hasAvatar={isGroup ? false : chatWithUser.hasAvatar}
                    version={isGroup ? undefined : chatWithUser.updatedAt}
                />
            </div>

            <div className="text-data">
                <div className="card-header">
                    <div className="username">
                        <span>{title}</span>
                    </div>
                    {lastMessageTime && (
                        <span className="last-message-time">{lastMessageTime}</span>
                    )}
                </div>

                <div className="last-message">
                    {lastMessageContent ? (
                        <span>
                            {senderLabel && <b>{senderLabel}: </b>}
                            {lastMessageContent}
                        </span>
                    ) : (
                        <span>No messages yet</span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default OpenChatCard
