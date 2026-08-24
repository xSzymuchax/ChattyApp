import ChatContent from './ChatContent';
import './ChatPanel.css'

import CurrentChatHeader from './CurrentChatHeader'
import MessageSender from './MessageSender';

function ChatPanel() {
    return(
        <div className="chat-panel">
            <CurrentChatHeader />
            <ChatContent />
            <MessageSender />
        </div>
    );
}

export default ChatPanel