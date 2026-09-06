import './GamesPanel.css'
import GameBoard from './GameBoard';
import GamesList from './GamesList';
import { useState } from 'react';

function GamesPanel({visible, onToggle}){
    const [isPlaying, setIsPlaying] = useState(false);

    return(
        <div className={`games-panel ${visible ? 'visible' : ''}`}>
            <div className='toggle-panel-switch' onClick={onToggle}/>
            <div className='games-panel-content'>
                <h2 className='games-panel-title'>Games Panel</h2>
                <div className='games-panel-content'>
                    {isPlaying ? <GameBoard /> : <GamesList />}                
                </div>
            </div>
        </div>
    );
}

export default GamesPanel;
