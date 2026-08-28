import './UsersPanel.css'

import UserSearchCard from './UserSearchCard'
import SearchBar from '../SearchBar'
import ProfileDisplay from './ProfileDisplay'
import OpenChatCard from '../ChatPanel/OpenChatCard';

import { useEffect, useState } from 'react';
import { getUserWithMatchingUsername } from '../../api/user';
import { getUserChats } from '../../api/chat';
import { useAuth } from '../../auth/AuthContext';


function UsersPanel({onChatSelected}) {  
    const {userId} = useAuth();
    const [activeView, setActiveView] = useState('usersList');
    const [foundUsers, setFoundUsers] = useState([]);
    const [foundChats, setFoundChats] = useState([]);

    const getMatchingUsers = async (username) => {
        try{
            if (!username){
                setFoundUsers([]);
                return;
            }

            const response = await getUserWithMatchingUsername(username);
            console.log(response);
            setFoundUsers(response.data);
        } catch (error) {
            console.log(error);
            setFoundUsers([]);
        } 
    }

    const getChatWithUser = (otherUserId) => {
        return foundChats.find((chat) => {
            return (
                (chat.firstUserId === userId && chat.secondUserId === otherUserId) ||
                (chat.firstUserId === otherUserId && chat.secondUserId === userId)
            );
        });
    };

    useEffect(() => {
        const getChats = async () => {
            try {
                const response = await getUserChats(userId);
                setFoundChats(response.data);
            } catch (error) {
                console.log("UsersPanel get chats error", error);
            }
        };

        if (userId) {
            getChats();
        }
    }, [userId]);

    const showUsers = (event) => {
        setActiveView('usersList');
    }

    const showChats = (event) => {
        setActiveView('chatsList');
    }

    const showProfile = (event) => {
        setActiveView('profile');
    }

    return(
        <div className="users-panel">
            <div className='tab-selector'>
                <button className='users-list-button' onClick={showUsers}>A</button>
                <button className='chats-list-button' onClick={showChats}>B</button>
                <button className='profile-button' onClick={showProfile}>C</button>
            </div>

            <div className='content-display'>
                
                
                {activeView === 'usersList' && (
                    <div className='view-container'>
                        <SearchBar onSearch={getMatchingUsers}/>

                        <div className='users-list-display'>
                            {foundUsers.map((user) => (
                                <UserSearchCard 
                                key={user.id}
                                userData={user}
                                getChatWithUser={getChatWithUser}
                                onChatSelected={onChatSelected}></UserSearchCard>
                            ))}
                        </div>
                    </div>
                    
                )}
                
                {activeView === 'chatsList' && (
                    <div className='view-container'>
                        <div className='chats-list-display'>
                            {foundChats.map((chat) => (
                                <OpenChatCard
                                key={chat.id}
                                chatData={chat}
                                onChatSelected={onChatSelected}></OpenChatCard>
                            ))}
                        </div>

                    </div>
                )}
                
                {activeView === 'profile' && (
                    <div className='view-container'>
                        <ProfileDisplay
                        
                        ></ProfileDisplay>
                    </div>
                )}

            </div>
        </div>
    );
}

export default UsersPanel