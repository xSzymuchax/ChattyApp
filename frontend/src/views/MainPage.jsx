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
    const [sentChatMessage, setSentChatMessage] = useState(null);
    const [invitationsTabToken, setInvitationsTabToken] = useState(0);

    const handleChatActivity = useCallback((message) => {
        setLastMessageEvent(message);
    }, []);

    const handleInviteChatMessage = useCallback((message) => {
        setLastMessageEvent(message);
        setSentChatMessage(message);
    }, []);

    const openInvitations = useCallback(() => {
        setGamesPanelVisible(true);
        setInvitationsTabToken((token) => token + 1);
    }, []);

    useIncomingMessageSound();

    return(
        <div className="main-page">
            <AppLayout
                usersPanel={
                    <UsersPanel
                        selectedChatId={selectedChatId}
                        onChatSelected={setSelectedChatId}
                        lastMessageEvent={lastMessageEvent}
                    />
                }
                chatPanel={
                    <ChatPanel
                        chatId={selectedChatId}
                        onOpenGames={() => setGamesPanelVisible(true)}
                        onOpenInvitations={openInvitations}
                        onOpponentChange={setOpponent}
                        onChatActivity={handleChatActivity}
                        sentChatMessage={sentChatMessage}
                    />
                }
                gamesPanel={
                    <GamesPanel
                        visible={gamesPanelVisible}
                        onToggle={() => setGamesPanelVisible((visible) => !visible)}
                        opponent={opponent}
                        chatId={selectedChatId}
                        invitationsTabToken={invitationsTabToken}
                        onChatMessage={handleInviteChatMessage}
                    />
                }>
            </AppLayout>    
        </div>
    )
}

export default MainPage