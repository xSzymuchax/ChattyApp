import './CurrentChatHeader.css'
import UserAvatar from '../UserAvatar'

function CurrentChatHeader({chatName, userId, version, hasAvatar, onOpenSettings}) {
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
            {onOpenSettings && (
                <button
                    type="button"
                    className="chat-settings-button"
                    aria-label="Chat settings"
                    onClick={onOpenSettings}
                >
                    <i className="icon-cogs"></i>
                </button>
            )}
        </div>
    )
}

export default CurrentChatHeader
