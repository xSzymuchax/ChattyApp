import { useEffect } from 'react';
import './ImagePreviewModal.css';

function ImagePreviewModal({ src, alt, onClose }) {
    useEffect(() => {
        if (!src) {
            return undefined;
        }

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose?.();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [src, onClose]);

    if (!src) {
        return null;
    }

    return (
        <div className="image-preview-overlay" onClick={onClose}>
            <img
                className="image-preview"
                src={src}
                alt={alt || ""}
                onClick={(event) => event.stopPropagation()}
            />
        </div>
    );
}

export default ImagePreviewModal
