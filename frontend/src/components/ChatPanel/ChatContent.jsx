import { useLayoutEffect, useRef, useState } from 'react';
import './ChatContent.css'
import ChatMessage from './ChatMessage'
import LinkWarningModal from './LinkWarningModal';
import DownloadConfirmModal from './DownloadConfirmModal';
import ImagePreviewModal from './ImagePreviewModal';
import { toSafeHttpUrl } from '../../util/messageLinks';
import { getChatAttachment } from '../../api/chat';

function ChatContent({
    chatId,
    chatMessages = [],
    hasMore = false,
    isLoadingOlder = false,
    scrollToBottomToken = 0,
    onLoadOlder,
    onOpenInvitations,
}) {
    const contentRef = useRef(null);
    const previousHeightRef = useRef(0);
    const previousFirstIdRef = useRef(undefined);
    const pendingPrependRef = useRef(false);
    const didInitScrollRef = useRef(false);
    const lastScrollTokenRef = useRef(0);
    const [pendingLink, setPendingLink] = useState(null);
    const [pendingDownload, setPendingDownload] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const captureHeightForPrepend = () => {
        const content = contentRef.current;
        if (!content) {
            return;
        }

        previousHeightRef.current = content.scrollHeight;
        pendingPrependRef.current = true;
    };

    const scrollToBottom = () => {
        const content = contentRef.current;
        if (!content) {
            return;
        }

        content.scrollTop = content.scrollHeight;
        previousHeightRef.current = content.scrollHeight;
    };

    useLayoutEffect(() => {
        if (!isLoadingOlder) {
            return;
        }

        captureHeightForPrepend();
    }, [isLoadingOlder]);

    useLayoutEffect(() => {
        didInitScrollRef.current = false;
        pendingPrependRef.current = false;
        previousFirstIdRef.current = chatMessages[0]?.id;
        lastScrollTokenRef.current = scrollToBottomToken;
        scrollToBottom();
    }, [chatId]);

    useLayoutEffect(() => {
        const content = contentRef.current;
        if (!content) {
            return;
        }

        const firstId = chatMessages[0]?.id;
        const prepended =
            pendingPrependRef.current ||
            (previousFirstIdRef.current !== undefined &&
                firstId !== previousFirstIdRef.current);

        previousFirstIdRef.current = firstId;

        if (prepended) {
            pendingPrependRef.current = false;
            content.scrollTop += content.scrollHeight - previousHeightRef.current;
            previousHeightRef.current = content.scrollHeight;
            return;
        }

        if (!didInitScrollRef.current) {
            if (chatMessages.length > 0) {
                didInitScrollRef.current = true;
                scrollToBottom();
            } else {
                previousHeightRef.current = content.scrollHeight;
            }
            lastScrollTokenRef.current = scrollToBottomToken;
            return;
        }

        if (scrollToBottomToken !== lastScrollTokenRef.current) {
            lastScrollTokenRef.current = scrollToBottomToken;
            scrollToBottom();
            return;
        }

        previousHeightRef.current = content.scrollHeight;
    }, [chatMessages, scrollToBottomToken]);

    useLayoutEffect(() => {
        const content = contentRef.current;
        if (!content || !hasMore || isLoadingOlder) {
            return;
        }

        if (content.scrollHeight <= content.clientHeight + 8) {
            captureHeightForPrepend();
            onLoadOlder?.();
        }
    }, [chatMessages, hasMore, onLoadOlder]);

    const handleScroll = () => {
        const content = contentRef.current;
        if (!content) {
            return;
        }

        if (content.scrollTop > 24 || !hasMore || isLoadingOlder) {
            return;
        }

        captureHeightForPrepend();
        onLoadOlder?.();
    };

    const handleLinkClick = (rawLink) => {
        const safeUrl = toSafeHttpUrl(rawLink);

        if (!safeUrl) {
            return;
        }

        setPendingLink(safeUrl);
    };

    const handleCancelLink = () => {
        setPendingLink(null);
    };

    const handleConfirmLink = () => {
        if (pendingLink) {
            window.open(pendingLink, '_blank', 'noopener,noreferrer');
        }

        setPendingLink(null);
    };

    const handleDownloadRequest = (fileName, messageId) => {
        setPendingDownload({ fileName, messageId });
    };

    const handleCancelDownload = () => {
        setPendingDownload(null);
    };

    const handleConfirmDownload = async () => {
        const download = pendingDownload;
        setPendingDownload(null);

        if (!download || !chatId) {
            return;
        }

        try {
            const response = await getChatAttachment(chatId, download.messageId);
            const objectUrl = URL.createObjectURL(response.data);
            const link = document.createElement("a");
            link.href = objectUrl;
            link.download = download.fileName || "attachment";
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(objectUrl);
        } catch (error) {
            console.log(error);
        }
    };

    return(
        <div className='chat-content' ref={contentRef} onScroll={handleScroll}>
            <div className='chat-content-spacer' aria-hidden="true"></div>
            {chatMessages.map((x) => (
                <ChatMessage 
                    key={x.id}
                    chatId={chatId}
                    message={x}
                    onLinkClick={handleLinkClick}
                    onOpenInvitations={onOpenInvitations}
                    onDownloadRequest={handleDownloadRequest}
                    onImageClick={(src, alt) => setPreviewImage({ src, alt })}>
                </ChatMessage>)
            )}
            <LinkWarningModal
                url={pendingLink}
                onConfirm={handleConfirmLink}
                onCancel={handleCancelLink}
            />
            <DownloadConfirmModal
                fileName={pendingDownload?.fileName}
                onConfirm={handleConfirmDownload}
                onCancel={handleCancelDownload}
            />
            <ImagePreviewModal
                src={previewImage?.src}
                alt={previewImage?.alt}
                onClose={() => setPreviewImage(null)}
            />
        </div>
    );
}

export default ChatContent
