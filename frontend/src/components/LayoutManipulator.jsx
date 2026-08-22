import './LayoutManipulator.css';

function LayoutManipulator({onMouseDown}) {
    return(
        <div 
        className="layout-manipulator" 
        onMouseDown={onMouseDown}
        />
    )
}

export default LayoutManipulator