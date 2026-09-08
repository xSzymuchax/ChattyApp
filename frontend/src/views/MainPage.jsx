import AppLayout from "../components/AppLayout"
import UsersPanel from '../components/UsersPanel/UsersPanel';
import ChatPanel from '../components/ChatPanel/ChatPanel';
import GamesPanel from '../components/GamesPanel/GamesPanel';
import { useState } from "react";

function MainPage() {
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [opponent, setOpponent] = useState(null);
    const [gamesPanelVisible, setGamesPanelVisible] = useState(false);

    return(
        <div className="main-page">
            <AppLayout
                usersPanel={<UsersPanel onChatSelected={setSelectedChatId}/>}
                chatPanel={
                    <ChatPanel
                        chatId={selectedChatId}
                        onOpenGames={() => setGamesPanelVisible(true)}
                        onOpponentChange={setOpponent}
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