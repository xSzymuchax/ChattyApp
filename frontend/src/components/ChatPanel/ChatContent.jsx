import './ChatContent.css'
import ChatMessage from './ChatMessage'

function ChatContent({chatMessages = []}) {
    return(
        <div className='chat-content'>
            {chatMessages.map((x) => (
                <ChatMessage 
                    key={x.id}
                    sender_id={x.senderId}
                    messageContent={x.content}>
                </ChatMessage>)
            )}
        </div>
    );
}

export default ChatContent