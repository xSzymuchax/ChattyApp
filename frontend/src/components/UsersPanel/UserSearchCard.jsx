import './UserSearchCard.css'

function UserSearchCard({username, profilePicture, description}){
    return (
        <div className="user-search-card">
            <div className="profile-picture">
                <image />
            </div>

            <div className="text-data">
                <div className="username">
                    <span>USERNAME</span>
                </div>

                <div className="description">
                    <span>Some user desription, because why not add it there to read.</span>
                </div>
            </div>
            
        </div>
    )
}

export default UserSearchCard