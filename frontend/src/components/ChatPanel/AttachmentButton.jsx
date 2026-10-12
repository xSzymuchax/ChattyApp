import { useRef } from 'react';
import './AttachmentButton.css';

const MAX_FILE_SIZE = 50 * 1024 * 1024;

function AttachmentButton({ onSelect, disabled = false }) {
    const inputRef = useRef(null);

    const handleChange = (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) {
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            onSelect?.(null, "File is too large (max 50 MB).");
            return;
        }

        onSelect?.(file, null);
    };

    return (
        <div className="attachment-button-wrap">
            <input
                ref={inputRef}
                type="file"
                className="attachment-input"
                onChange={handleChange}
            />
            <button
                type="button"
                className="open-attachment-button"
                aria-label="Attach file"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
            >
                <svg
                    className="attachment-button-icon"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    focusable="false"
                >
                    <path
                        d="M8 7v8.5a4 4 0 0 0 8 0V7.8a2.5 2.5 0 0 0-5 0v7.4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
            </button>
        </div>
    );
}

export default AttachmentButton
