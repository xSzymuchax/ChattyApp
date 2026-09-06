import { useEffect, useState } from 'react';
import './OpenChatCard.css'
import { getUserById } from '../../api/user';
import { useAuth } from '../../auth/AuthContext';

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

        if (chatData && userId)
            getUser();

        
    }, [chatData, userId])

    const lastMessageContent = chatData.lastMessageContent;
    const lastMessageSenderId = Number(chatData.lastMessageSenderId);
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
                <image />
            </div>

            <div className="text-data">
                <div className="chat-name">
                    <span>{chatWithUser.username}</span>
                </div>

                <div className="last-message">
                    {lastMessageContent ? (
                        <span>
                            {senderLabel && <b className='username'>{senderLabel}: </b>}
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
