import './UserSearchCard.css'

function UserSearchCard({userData}){
    return (
        <div className="user-search-card">
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