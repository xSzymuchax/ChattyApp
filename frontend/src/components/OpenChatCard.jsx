import './OpenChatCard.css'

function OpenChatCard() {
    return (
        <div className="open-chat-card">
            <div className="profile-picture">
                <image />
            </div>

            <div className="text-data">
                <div className="chat-name">
                    <span>CHAT_NAME</span>
                </div>

                <div className="last-message">
                    <span><b className='username'>Username:</b> So... When will you be available? :D</span>
                </div>
            </div>
        </div>
    );
}

export default OpenChatCard