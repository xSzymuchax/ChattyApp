import { createChat } from '../../api/chat';
import { useAuth } from '../../auth/AuthContext';
import './UserSearchCard.css'

function UserSearchCard({userData, getChatWithUser, onChatSelected}){
    const { userId } = useAuth();

    const handleClick = async () => {
        try {
            const existingChat = getChatWithUser(userData.id);

            if (existingChat){
                onChatSelected(existingChat.id);
                return;
            }
                
            const response = await createChat(userId, userData.id);
            onChatSelected(response.data.id);

        } catch (error) {
            console.log(error);
        }    
    }
    
    return (
        <div className="user-search-card" onClick={handleClick}>
            <div className="profile-picture">
                <image />
            </div>

            <div className="text-data">
                <div className="username">
                    <span>{userData.username}</span>
                </div>

                <div className="description">
                    <span>{userData.desription}</span>
                </div>
            </div>
            
        </div>
    )
}

export default UserSearchCard