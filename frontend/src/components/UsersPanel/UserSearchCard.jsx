import { createChat, findChatBetweenUsers, getUserChats } from '../../api/chat';
import { useAuth } from '../../auth/AuthContext';
import './UserSearchCard.css'

function UserSearchCard({userData, getChatWithUser, onChatSelected, onChatReady}){
    const { userId } = useAuth();

    const handleClick = async () => {
        try {
            const existingChat = getChatWithUser(userData.id);

            if (existingChat){
                onChatSelected(existingChat.id);
                return;
            }

            try {
                const response = await createChat(userId, userData.id);
                onChatReady?.(response.data);
                onChatSelected(response.data.id);
                return;
            } catch (error) {
                if (error.response?.status !== 409) {
                    throw error;
                }
            }

            const chatsResponse = await getUserChats(userId);
            const existingAfterConflict = findChatBetweenUsers(
                chatsResponse.data,
                userId,
                userData.id
            );

            if (existingAfterConflict) {
                onChatReady?.(existingAfterConflict);
                onChatSelected(existingAfterConflict.id);
            }
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
                    <span>{userData.description}</span>
                </div>
            </div>
            
        </div>
    )
}

export default UserSearchCard
