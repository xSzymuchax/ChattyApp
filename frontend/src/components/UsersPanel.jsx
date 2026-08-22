import './UsersPanel.css'
import UserSearchCard from './UserSearchCard'
import SearchBar from './SearchBar'

function UsersPanel({children}) {
    return(
        <div className="users-panel">
            <div className='tab-selector'>
                <button className='users-list-button'></button>
                <button className='chats-list-button'></button>
                <button className='profile-button'></button>
            </div>

            <div className='content-display'>
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

                <div className='chats-list-display'>

                </div>

                <div className='profile-display'>

                </div>
            </div>
        </div>
    );
}

export default UsersPanel