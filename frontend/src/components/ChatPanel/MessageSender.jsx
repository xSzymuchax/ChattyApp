import { useState } from 'react';
import './MessageSender.css'
import { useSocket } from '../../websocket/WebSocketContext';
import { useAuth } from '../../auth/AuthContext';

function MessageSender({chatId, onMessageSend}) {
    const {userId} = useAuth();
    const [content, setContent] = useState();
    const {socket} = useSocket();
    const [counter, setCounter] = useState(-1);


    const handleTyping = (event) => {
        setContent(event.target.value);
    }

    const handleSendMessage = () => {
        console.log(content);

        if (!content || content==='')
            return;

        const dataToSend = JSON.stringify({
            type: "message",
            chatId: chatId,
            content: content
        });

        console.log(dataToSend);

        socket.send(dataToSend);
        onMessageSend({id: counter, senderId: userId, content: content});
        setCounter((prev) => prev-1);
        setContent("");
    }

    const resizeTextArea = (event) => {
        event.target.style.height = "auto";
        event.target.style.height = `${event.target.scrollHeight}px`;
    }
    
    return (
        <div className='message-sender'>
            <textarea 
            className='text-input' 
            onInput={resizeTextArea}
            value={content}
            onChange={handleTyping}
            maxLength={512}></textarea>

            <button onClick={handleSendMessage} className='send-message-button'>S</button>
        </div>
    )
}

export default MessageSender