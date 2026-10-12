import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import './MessageSender.css'
import { useSocket } from '../../websocket/WebSocketContext';
import { useAuth } from '../../auth/AuthContext';

const MAX_LENGTH = 512;

const MessageSender = forwardRef(function MessageSender({chatId, onMessageSend}, ref) {
    const {userId} = useAuth();
    const [content, setContent] = useState();
    const {socket} = useSocket();
    const [counter, setCounter] = useState(-1);
    const textareaRef = useRef(null);

    const resizeTextArea = (element) => {
        if (!element) {
            return;
        }

        element.style.height = "auto";
        element.style.height = `${element.scrollHeight}px`;
    };

    useEffect(() => {
        resizeTextArea(textareaRef.current);
    }, [content]);

    useImperativeHandle(ref, () => ({
        insertText(text) {
            if (!text) {
                return;
            }

            setContent((prev) => `${prev ?? ''}${text}`.slice(0, MAX_LENGTH));
            textareaRef.current?.focus();
        },
    }));

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

        if (!socket || socket.readyState !== WebSocket.OPEN) {
            return;
        }

        socket.send(dataToSend);
        onMessageSend({
            chatId,
            id: counter,
            senderId: userId,
            content: content,
            createdAt: new Date().toISOString(),
        });
        setCounter((prev) => prev-1);
        setContent("");
    }

    const handleKeyDown = (event) => {
        if (event.key !== 'Enter' || event.shiftKey) {
            return;
        }

        event.preventDefault();
        handleSendMessage();
    }

    const handleInput = (event) => {
        resizeTextArea(event.target);
    }
    
    return (
        <div className='message-sender'>
            <textarea 
            className='text-input' 
            ref={textareaRef}
            onInput={handleInput}
            value={content ?? ''}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            maxLength={MAX_LENGTH}></textarea>

            <button type='button' onClick={handleSendMessage} className='send-message-button' aria-label="Send">
                <i className="icon-right-circled"></i>
            </button>
        </div>
    )
});

export default MessageSender
