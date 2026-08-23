import { useState } from 'react'
import './App.css'
import AppLayout from './components/AppLayout';
import UsersPanel from './components/UsersPanel/UsersPanel';
import ChatPanel from './components/ChatPanel/ChatPanel';
import GamesPanel from './components/GamesPanel/GamesPanel';

function App() {
  return (
    <AppLayout
      usersPanel={<UsersPanel />}
      chatPanel={<ChatPanel />}
      gamesPanel={<GamesPanel />}>
    </AppLayout>
  );
}

export default App
