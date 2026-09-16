import { useEffect, useState } from 'react';
import './OpenChatCard.css'
import { getUserById } from '../../api/user';
import { useAuth } from '../../auth/AuthContext';
import { formatLastMessageTime } from '../../util/chatList';
import UserAvatar from '../UserAvatar';

function OpenChatCard({chatData, onChatSelected}) {
    const [chatWithUser, setChatWithUser] = useState({});
    const {userId} = useAuth();
    
    useEffect(() => {
        const getUser = async () => {
            const otherUserId =
                Number(chatData.firstUserId) === Number(userId)
                    ? chatData.secondUserId
                    : chatData.firstUserId;
            
            try {
                const response = await getUserById(otherUserId);
                setChatWithUser(response.data);

            } catch (error) {
                console.log(error);
            }
        };

        if (chatData?.id && userId)
            getUser();

        
    }, [chatData?.id, chatData?.firstUserId, chatData?.secondUserId, userId]);

    const lastMessageContent = chatData.lastMessageContent;
    const lastMessageSenderId = Number(chatData.lastMessageSenderId);
    const lastMessageTime = formatLastMessageTime(chatData.lastMessageCreatedAt);
    const senderLabel =
        lastMessageSenderId === Number(userId)
            ? 'You'
            : chatWithUser.username;

    const handleClick = () => {
        onChatSelected(chatData.id);
    };
    
    return (
        <div className="open-chat-card"
             onClick={handleClick}>
            <div className="profile-picture">
                <UserAvatar
                    userId={chatWithUser.id}
                    username={chatWithUser.username}
                    hasAvatar={chatWithUser.hasAvatar}
                    version={chatWithUser.updatedAt}
                />
            </div>

            <div className="text-data">
                <div className="card-header">
                    <div className="username">
                        <span>{chatWithUser.username}</span>
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
