import AppLayout from "../components/AppLayout"
import UsersPanel from '../components/UsersPanel/UsersPanel';
import ChatPanel from '../components/ChatPanel/ChatPanel';
import GamesPanel from '../components/GamesPanel/GamesPanel';

function MainPage() {
    return(
        <div className="main-page">
            <AppLayout
                usersPanel={<UsersPanel />}
                chatPanel={<ChatPanel />}
                gamesPanel={<GamesPanel />}>
            </AppLayout>    
        </div>
    )
}

export default MainPage