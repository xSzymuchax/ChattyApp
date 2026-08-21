import { useState } from "react";

import './AppLayout.css'

function AppLayout({children}) {
    const [leftWidth, setLeftWidth] = useState(300);
    const [rightWidth, setRightWidth] = useState(300);
    
    return(
        <div 
            className="app-layout"
            style = {{
                "--left-width": `${leftWidth}px`,
                "--right-width": `${rightWidth}px`,
            }}
            >
            {children}
        </div>
    );
}

export default AppLayout