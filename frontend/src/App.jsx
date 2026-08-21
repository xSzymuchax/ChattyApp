import { useState } from 'react'
import './App.css'
import AppLayout from './components/AppLayout';
import UsersPanel from './components/UsersPanel';
import ChatPanel from './components/ChatPanel';
import GamesPanel from './components/GamesPanel';

function App() {
  return (
    <AppLayout>
      <UsersPanel></UsersPanel>
      <ChatPanel></ChatPanel>
      <GamesPanel></GamesPanel>
    </AppLayout>
  );
}

export default App
