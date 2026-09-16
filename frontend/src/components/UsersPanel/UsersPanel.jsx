import './UsersPanel.css'

import UserSearchCard from './UserSearchCard'
import SearchBar from '../SearchBar'
import ProfileDisplay from './ProfileDisplay'
import OpenChatCard from '../ChatPanel/OpenChatCard';
import GearButton from './GearButton';

import { useEffect, useState } from 'react';
import { getUserWithMatchingUsername } from '../../api/user';
import { findChatBetweenUsers, getUserChats } from '../../api/chat';
import { useAuth } from '../../auth/AuthContext';
import { useSocket } from '../../websocket/WebSocketContext';
import { applyMessageToChatList, sortChatsByLastMessage } from '../../util/chatList';


function UsersPanel({onChatSelected, lastMessageEvent}) {  
    const {userId} = useAuth();
    const {subscribeToMessages} = useSocket();
    const [activeView, setActiveView] = useState('chatsList');
    const [foundUsers, setFoundUsers] = useState([]);
    const [foundChats, setFoundChats] = useState([]);

    const getMatchingUsers = async (username) => {
        const query = username?.trim();

        if (!query){
            setFoundUsers([]);
            return;
        }

        try{
            const response = await getUserWithMatchingUsername(query);
            setFoundUsers(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.log(error);
            setFoundUsers([]);
        } 
    }

    const getChatWithUser = (otherUserId) => {
        return findChatBetweenUsers(foundChats, userId, otherUserId);
    };

    const handleChatReady = (chat) => {
        if (!chat?.id) {
            return;
        }

        setFoundChats((prev) => {
            if (findChatBetweenUsers(prev, chat.firstUserId, chat.secondUserId)) {
                return prev;
            }

            return [...prev, chat];
        });
    };

    const loadChats = async () => {
        if (!userId) {
            return;
        }

        try {
            const response = await getUserChats(userId);
            setFoundChats(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.log("UsersPanel get chats error", error);
        }
    };

    useEffect(() => {
        if (userId) {
            loadChats();
        }
    }, [userId]);

    useEffect(() => {
        if (!lastMessageEvent) {
            return;
        }

        setFoundChats((prev) => applyMessageToChatList(prev, lastMessageEvent));
    }, [lastMessageEvent]);

    useEffect(() => {
        const unsubscribe = subscribeToMessages((payload) => {
            if (payload.type === "chatCreated") {
                handleChatReady(payload.message);
                return;
            }

            if (payload.type === "message") {
                setFoundChats((prev) => applyMessageToChatList(prev, payload.message));
            }
        });

        return unsubscribe;
    }, [subscribeToMessages]);

    const showUsers = () => {
        setActiveView('usersList');
    }

    const showChats = () => {
        setActiveView('chatsList');
    }

    const showProfile = () => {
        setActiveView('profile');
    }

    const sortedChats = sortChatsByLastMessage(foundChats);

    return(
        <div className="users-panel">
            <div className='tab-selector'>
                <button className='users-list-button' onClick={showUsers} aria-label="Users">
                    <i className="icon-group"></i>
                </button>
                <button className='chats-list-button' onClick={showChats} aria-label="Chats">
                    <i className="icon-chat"></i>
                </button>
                <button className='profile-button' onClick={showProfile} aria-label="Profile">
                    <i className="icon-user"></i>
                </button>
                <GearButton />
            </div>

            <div className='content-display'>
                
                
                {activeView === 'usersList' && (
                    <div className='view-container'>
                        <SearchBar onSearch={getMatchingUsers}/>

                        <div className='users-list-display'>
                            {foundUsers.length === 0 ? (
                                <p className="list-empty">No users found</p>
                            ) : (
                                foundUsers.map((user) => (
                                    <UserSearchCard 
                                    key={user.id}
                                    userData={user}
                                    getChatWithUser={getChatWithUser}
                                    onChatSelected={onChatSelected}
                                    onChatReady={handleChatReady}></UserSearchCard>
                                ))
                            )}
                        </div>
                    </div>
                    
                )}
                
                {activeView === 'chatsList' && (
                    <div className='view-container'>
                        <div className='chats-list-display'>
                            {sortedChats.length === 0 ? (
                                <p className="list-empty">No existing chats.</p>
                            ) : (
                                sortedChats.map((chat) => (
                                    <OpenChatCard
                                    key={chat.id}
                                    chatData={chat}
                                    onChatSelected={onChatSelected}></OpenChatCard>
                                ))
                            )}
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