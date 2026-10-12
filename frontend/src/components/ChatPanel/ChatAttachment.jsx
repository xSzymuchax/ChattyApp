import { useEffect, useState } from 'react';
import { getChatAttachment } from '../../api/chat';

function ChatAttachment({ chatId, message, onDownloadRequest, onImageClick }) {
    const [imageUrl, setImageUrl] = useState("");
    const attachment = message.attachment;

    useEffect(() => {
        let objectUrl = "";
        let cancelled = false;

        if (!chatId || !message?.id || attachment?.kind !== "image") {
            return undefined;
        }

        const loadImage = async () => {
            try {
                const response = await getChatAttachment(chatId, message.id);
                objectUrl = URL.createObjectURL(response.data);

                if (cancelled) {
                    URL.revokeObjectURL(objectUrl);
                    return;
                }

                setImageUrl(objectUrl);
            } catch (error) {
                console.log(error);
            }
        };

        loadImage();

        return () => {
            cancelled = true;

            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [chatId, message?.id, attachment?.kind]);

    if (!attachment) {
        return null;
    }

    if (attachment.kind === "image") {
        if (!imageUrl) {
            return <div className="chat-image-placeholder"></div>;
        }

        return (
            <button
                type="button"
                className="chat-image-button"
                onClick={() => onImageClick?.(imageUrl, attachment.name)}
            >
                <img
                    className="chat-image"
                    src={imageUrl}
                    alt={attachment.name}
                />
            </button>
        );
    }

    return (
        <button
            type="button"
            className="chat-file-button"
            onClick={() => onDownloadRequest?.(attachment.name, message.id)}
        >
            <svg
                className="chat-file-icon"
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
            <span className="chat-file-name">{attachment.name}</span>
        </button>
    );
}

export default ChatAttachment
