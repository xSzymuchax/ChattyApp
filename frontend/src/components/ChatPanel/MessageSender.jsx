import './MessageSender.css'

function MessageSender() {
    const resizeTextArea = (event) => {
        event.target.style.height = "auto";
        event.target.style.height = `${event.target.scrollHeight}px`;
    }
    
    return (
        <div className='message-sender'>
            <textarea 
            className='text-input' 
            onInput={resizeTextArea}
            maxLength={512}></textarea>

            <button className='send-message-button'>S</button>
        </div>
    )
}

export default MessageSender