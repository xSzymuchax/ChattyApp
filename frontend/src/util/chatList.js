export const applyMessageToChatList = (chats, message) => {
    const chatId = Number(message?.chatId);

    if (!chatId) {
        return chats;
    }

    return (chats ?? []).map((chat) => {
        if (Number(chat.id) !== chatId) {
            return chat;
        }

        return {
            ...chat,
            lastMessageId: message.id ?? chat.lastMessageId,
            lastMessageContent: message.content,
            lastMessageSenderId: message.senderId,
            lastMessageCreatedAt: message.createdAt ?? new Date().toISOString(),
        };
    });
};

export const sortChatsByLastMessage = (chats) => {
    return [...(chats ?? [])].sort((a, b) => {
        const aTime = Date.parse(a.lastMessageCreatedAt ?? "") || 0;
        const bTime = Date.parse(b.lastMessageCreatedAt ?? "") || 0;

        if (bTime !== aTime) {
            return bTime - aTime;
        }

        const aLast = Number(a.lastMessageId ?? 0);
        const bLast = Number(b.lastMessageId ?? 0);

        if (bLast !== aLast) {
            return bLast - aLast;
        }

        return Number(b.id) - Number(a.id);
    });
};

export const formatLastMessageTime = (value) => {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const now = new Date();
    const sameDay = date.toDateString() === now.toDateString();

    if (sameDay) {
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    return date.toLocaleDateString([], {
        day: "numeric",
        month: "short",
    });
};
