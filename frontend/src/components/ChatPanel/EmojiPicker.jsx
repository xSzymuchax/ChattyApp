import { useEffect, useRef, useState } from 'react';
import './EmojiPicker.css';

const EMOJIS = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '😉', '😍', '🥰', '😘', '😗', '😋', '😛', '😜', '🤪',
    '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁',
    '😢', '😭', '😤', '😠', '😡', '🤯', '😳', '🥺', '😱', '🤔',
    '😴', '🤕', '💀', '👀', '👍', '👎', '👏', '🙌', '🙏', '💪',
    '🔥', '❤️', '✨', '🎉', '🤝', '💯', '✅', '⭐', '🌈', '🍀',
];

function EmojiPicker({ onSelect }) {
    const [isOpen, setIsOpen] = useState(false);
    const pickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (emoji) => {
        onSelect?.(emoji);
    };

    return (
        <div className="emoji-picker-wrap" ref={pickerRef}>
            <button
                type="button"
                className="open-emoji-button"
                aria-label="Emojis"
                aria-expanded={isOpen}
                onClick={() => setIsOpen((open) => !open)}
            >
                <svg
                    className="emoji-button-icon"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    focusable="false"
                >
                    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                    <circle cx="9" cy="10" r="1.25" fill="currentColor" />
                    <circle cx="15" cy="10" r="1.25" fill="currentColor" />
                    <path
                        d="M8.5 14.5c1 1.6 2.2 2.3 3.5 2.3s2.5-.7 3.5-2.3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
            </button>

            {isOpen && (
                <div className="emoji-picker" role="listbox" aria-label="Emojis">
                    {EMOJIS.map((emoji, index) => (
                        <button
                            key={`${emoji}-${index}`}
                            type="button"
                            className="emoji-option"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => handleSelect(emoji)}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default EmojiPicker
