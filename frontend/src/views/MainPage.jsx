import AppLayout from "../components/AppLayout"
import UsersPanel from '../components/UsersPanel/UsersPanel';
import ChatPanel from '../components/ChatPanel/ChatPanel';
import GamesPanel from '../components/GamesPanel/GamesPanel';
import { useState } from "react";

function MainPage() {
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [gamesPanelVisible, setGamesPanelVisible] = useState(false);

    return(
        <div className="main-page">
            <AppLayout
                usersPanel={<UsersPanel onChatSelected={setSelectedChatId}/>}
                chatPanel={
                    <ChatPanel
                        chatId={selectedChatId}
                        onOpenGames={() => setGamesPanelVisible(true)}
                    />
                }
                gamesPanel={
                    <GamesPanel
                        visible={gamesPanelVisible}
                        onToggle={() => setGamesPanelVisible((visible) => !visible)}
                    />
                }>
            </AppLayout>    
        </div>
    )
}

export default MainPage