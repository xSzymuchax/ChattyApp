const serializeMessage = (message) => {
    if (!message) {
        return null;
    }

    const json = typeof message.toJSON === "function" ? message.toJSON() : { ...message };
    const hasAttachment = Boolean(json.attachmentName);

    return {
        id: json.id,
        chatId: json.chatId,
        senderId: json.senderId,
        content: json.content,
        createdAt: json.createdAt,
        attachment: hasAttachment
            ? {
                name: json.attachmentName,
                mime: json.attachmentMime,
                size: json.attachmentSize,
                kind: json.attachmentKind,
            }
            : null,
    };
};

const lastMessagePreview = (message) => {
    if (!message) {
        return null;
    }

    if (message.attachmentKind === "image") {
        return "Image";
    }

    if (message.attachmentKind === "file") {
        return message.attachmentName;
    }

    return message.content ?? null;
};

module.exports = {
    serializeMessage,
    lastMessagePreview,
};
