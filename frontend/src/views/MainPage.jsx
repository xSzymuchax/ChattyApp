import AppLayout from "../components/AppLayout"
import UsersPanel from '../components/UsersPanel/UsersPanel';
import ChatPanel from '../components/ChatPanel/ChatPanel';
import GamesPanel from '../components/GamesPanel/GamesPanel';
import { useState } from "react";

function MainPage() {
    const [selectedChatId, setSelectedChatId] = useState(null);
    return(
        <div className="main-page">
            <AppLayout
                usersPanel={<UsersPanel onChatSelected={setSelectedChatId}/>}
                chatPanel={<ChatPanel chatId={selectedChatId}/>}
                gamesPanel={<GamesPanel />}>
            </AppLayout>    
        </div>
    )
}

export default MainPage