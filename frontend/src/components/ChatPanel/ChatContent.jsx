import './ChatContent.css'
import ChatMessage from './ChatMessage'

function ChatContent() {
    return(
        <div className='chat-content'>
            <ChatMessage sender_id={1}/>
            <ChatMessage sender_id={2}/>
            <ChatMessage sender_id={1}/>
            <ChatMessage sender_id={2}/>
            <ChatMessage sender_id={1}/>
            <ChatMessage sender_id={2}/>
            <ChatMessage sender_id={1}/>
            <ChatMessage sender_id={2}/>
        </div>
    )
}

export default ChatContent