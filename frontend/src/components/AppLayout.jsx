import { useState } from "react";
import LayoutManipulator from './LayoutManipulator'

import './AppLayout.css'

function AppLayout({usersPanel, chatPanel, gamesPanel}) {
    const minWidthUserPanel = 260;
    const minWidthGamesPanel = 100;
    
    const [leftWidth, setLeftWidth] = useState(minWidthUserPanel);
    const [rightWidth, setRightWidth] = useState(minWidthGamesPanel);
    
    const handleMouseDown = (event, width, setWidth, direction) => {
        const startX = event.clientX;
        const startWidth = width;

        const handleMouseMove = (event) => {
            const delta = event.clientX - startX;
            setWidth(Math.max(minWidthUserPanel, startWidth + delta * direction));
        }

        const handleMouseUp = (event) => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    return(
        <div 
            className="app-layout"
            style = {{
                "--left-width": `${leftWidth}px`
            }}
            >
            {usersPanel}

            <LayoutManipulator 
                onMouseDown={(event) => 
                    handleMouseDown(
                        event,
                        leftWidth,
                        setLeftWidth,
                        1
                    )
                }
            />

            {chatPanel}
            {gamesPanel}
        </div>
    );
}

export default AppLayout