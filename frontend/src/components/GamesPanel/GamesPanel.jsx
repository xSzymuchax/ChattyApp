import { useEffect, useState } from 'react'
import './GamesPanel.css'

function GamesPanel({children}){
    const [panelVisible, setPanelVisible] = useState(false);

    const switchVisible = (event) => {
        setPanelVisible(!panelVisible);
    }

    return(
        <div className={`games-panel ${panelVisible ? 'visible' : ''}`}>
            <div className='toggle-panel-switch' onClick={switchVisible}/>
        </div>
    )
}

export default GamesPanel