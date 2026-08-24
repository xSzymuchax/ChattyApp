import './UsersPanel.css'

import UserSearchCard from './UserSearchCard'
import SearchBar from '../SearchBar'
import ProfileDisplay from './ProfileDisplay'

import { useState } from 'react'
;
import OpenChatCard from '../ChatPanel/OpenChatCard';

function UsersPanel({children}) {  
    const [activeView, setActiveView] = useState('usersList');
    
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
                        <SearchBar />

                        <div className='users-list-display'>
                            <UserSearchCard />
                            <UserSearchCard />
                            <UserSearchCard />
                            <UserSearchCard />
                            <UserSearchCard />
                            <UserSearchCard />
                            <UserSearchCard />
                            <UserSearchCard />
                            <UserSearchCard />
                            <UserSearchCard />
                            <UserSearchCard />
                        </div>
                    </div>
                    
                )}
                
                {activeView === 'chatsList' && (
                    <div className='view-container'>
                        <SearchBar />

                        <div className='chats-list-display'>
                            <OpenChatCard></OpenChatCard>
                        </div>

                    </div>
                )}
                
                {activeView === 'profile' && (
                    <div className='view-container'>
                        <ProfileDisplay></ProfileDisplay>
                    </div>
                )}

            </div>
        </div>
    );
}

export default UsersPanel