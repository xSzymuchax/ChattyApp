import AppLayout from "../components/AppLayout"
import UsersPanel from '../components/UsersPanel/UsersPanel';
import ChatPanel from '../components/ChatPanel/ChatPanel';
import GamesPanel from '../components/GamesPanel/GamesPanel';
import { useCallback, useState } from "react";
import { useIncomingMessageSound } from "../websocket/useIncomingMessageSound";

function MainPage() {
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [opponent, setOpponent] = useState(null);
    const [gamesPanelVisible, setGamesPanelVisible] = useState(false);
    const [lastMessageEvent, setLastMessageEvent] = useState(null);

    const handleChatActivity = useCallback((message) => {
        setLastMessageEvent(message);
    }, []);

    useIncomingMessageSound();

    return(
        <div className="main-page">
            <AppLayout
                usersPanel={
                    <UsersPanel
                        onChatSelected={setSelectedChatId}
                        lastMessageEvent={lastMessageEvent}
                    />
                }
                chatPanel={
                    <ChatPanel
                        chatId={selectedChatId}
                        onOpenGames={() => setGamesPanelVisible(true)}
                        onOpponentChange={setOpponent}
                        onChatActivity={handleChatActivity}
                    />
                }
                gamesPanel={
                    <GamesPanel
                        visible={gamesPanelVisible}
                        onToggle={() => setGamesPanelVisible((visible) => !visible)}
                        opponent={opponent}
                    />
                }>
            </AppLayout>    
        </div>
    )
}

export default MainPage