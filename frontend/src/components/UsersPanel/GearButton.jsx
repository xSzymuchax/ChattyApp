import { useEffect, useRef, useState } from 'react';
import { THEMES, applyTheme, getTheme } from '../../theme';
import './GearButton.css';

function GearButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [theme, setTheme] = useState(getTheme);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectTheme = (nextTheme) => {
        applyTheme(nextTheme);
        setTheme(nextTheme);
        setIsOpen(false);
    };

    return (
        <div className="gear-button-wrap" ref={menuRef}>
            <button
                className="gear-button"
                type="button"
                aria-label="Color schema"
                onClick={() => setIsOpen((open) => !open)}
            >
                <i className="icon-cogs"></i>
            </button>

            {isOpen && (
                <div className="theme-menu">
                    {THEMES.map((name) => (
                        <button
                            key={name}
                            type="button"
                            className={`theme-option ${theme === name ? 'selected' : ''}`}
                            onClick={() => handleSelectTheme(name)}
                        >
                            <span className={`theme-swatch theme-swatch-${name}`}></span>
                            {name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default GearButton;
