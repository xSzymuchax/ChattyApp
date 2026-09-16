import './CurrentChatHeader.css'
import UserAvatar from '../UserAvatar'

function CurrentChatHeader({chatName, userId, version, hasAvatar}) {
    return (
        <div className='current-chat-header'>
            <div className='chat-image'>
                <UserAvatar
                    userId={userId}
                    username={chatName}
                    hasAvatar={hasAvatar}
                    version={version}
                />
            </div>
            <div className='chat-name'>{chatName ?? ''}</div>
        </div>
    )
}

export default CurrentChatHeader
