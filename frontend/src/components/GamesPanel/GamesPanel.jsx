import './GamesPanel.css'
import GameBoard from './GameBoard';
import GamesList from './GamesList';
import GamesInvitations from './GamesInvitations';
import { useState } from 'react';

function GamesPanel({visible, onToggle}){
    const [isPlaying, setIsPlaying] = useState(false);
    const [idleView, setIdleView] = useState('games');

    return(
        <div className={`games-panel ${visible ? 'visible' : ''}`}>
            <div className='toggle-panel-switch' onClick={onToggle}/>
            <div className='games-panel-content'>
                <h2 className='games-panel-title'>Games Panel</h2>
                {isPlaying ? (
                    <GameBoard />
                ) : (
                    <>
                        <div className='tab-switcher'>
                            <div
                                className={`toggle-panel-switch ${idleView === 'games' ? 'active' : ''}`}
                                onClick={() => setIdleView('games')}
                            >
                                Games
                            </div>
                            <div
                                className={`toggle-panel-switch ${idleView === 'invitations' ? 'active' : ''}`}
                                onClick={() => setIdleView('invitations')}
                            >
                                Invitations
                            </div>
                        </div>
                        {idleView === 'games' ? (
                            <GamesList onSelectGame={() => console.log('game selected')} />
                        ) : (
                            <GamesInvitations
                                invitations={[]}
                                onAccept={() => console.log('invitation accepted')}
                                onDecline={() => console.log('invitation declined')}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default GamesPanel;
