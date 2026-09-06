import './CurrentChatHeader.css'

function CurrentChatHeader({chatName}) {
    return (
        <div className='current-chat-header'>
            <image className='chat-image' src=''></image>
            <div className='chat-name'>{chatName ?? ''}</div>
        </div>
    )
}

export default CurrentChatHeader