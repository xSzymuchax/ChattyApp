import { useEffect, useState } from 'react';
import './OpenChatCard.css'
import { getUserById } from '../../api/user';
import { useAuth } from '../../auth/AuthContext';

function OpenChatCard({chatData, chatContent}) {
    const [chatWithUser, setChatWithUser] = useState({});
    const {userId} = useAuth();
    
    useEffect(() => {
        const getUser = async () => {
            const otherUser = chatData.firstUserId==userId ? chatData.secondUserId : chatData.firstUserId;
            
            try {
                const response = await getUserById(otherUser);
                setChatWithUser(response.data);

            } catch (error) {
                console.log(error);
            }
        };

        if (chatData && userId)
            getUser();

        
    }, [chatData, userId])
    
    return (
        <div className="open-chat-card">
            <div className="profile-picture">
                <image />
            </div>

            <div className="text-data">
                <div className="chat-name">
                    <span>{chatWithUser.username}</span>
                </div>

                <div className="last-message">
                    <span><b className='username'>Username:</b> So... When will you be available? :D</span>
                </div>
            </div>
        </div>
    );
}

export default OpenChatCard