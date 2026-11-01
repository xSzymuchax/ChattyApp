const { Chat, Message } = require("../../models");
const createChatRepository = require("./chat.repository");
const { serializeMessage } = require("../../util/messageView");
const { processAttachment } = require("../../util/attachment");
const { saveAttachment, readAttachment } = require("../../util/fileStore");
const chatRepository = createChatRepository(Chat, Message);

const normalizeUserIds = (firstUserId, secondUserId) => {
    const lowerId = Math.min(firstUserId, secondUserId);
    const higherId = Math.max(firstUserId, secondUserId);

    return {
        firstUserId: lowerId,
        secondUserId: higherId,
    };
};

const isParticipant = (chat, senderId) => {
    return (
        Number(chat.firstUserId) === Number(senderId) ||
        Number(chat.secondUserId) === Number(senderId)
    );
};

const realtimeGatewayUrl = () => {
    if (process.env.REALTIME_GATEWAY_URL)
        return process.env.REALTIME_GATEWAY_URL;

    if (process.env.NODE_ENV === "test")
        return "";

    return "http://localhost:3300";
};

const toPublicChat = (chat) => {
    const json = typeof chat?.toJSON === "function" ? chat.toJSON() : chat;

    return {
        id: json.id,
        firstUserId: json.firstUserId,
        secondUserId: json.secondUserId,
    };
};

const notifyRealtime = (userId, type, message) => {
    const url = realtimeGatewayUrl();

    if (!url || !userId || !message) {
        return;
    }

    fetch(`${url}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId,
            type,
            message,
        }),
    }).catch(() => {});
};

const notifyChatCreated = (userId, chat) => {
    notifyRealtime(userId, "chatCreated", chat);
};

const notifyRecipient = (userId, message) => {
    notifyRealtime(userId, "message", message);
};

const chatService = {
    async createChat(data, requesterId) {
        if (
            Number(requesterId) !== Number(data.firstUserId) &&
            Number(requesterId) !== Number(data.secondUserId)
        ) {
            return { error: "forbidden" };
        }

        const { firstUserId, secondUserId } = normalizeUserIds(
            data.firstUserId,
            data.secondUserId
        );

        const existingChat = await chatRepository.getChatByUserIds(
            firstUserId,
            secondUserId
        );

        if (existingChat) return null;

        const created = await chatRepository.createChat({ firstUserId, secondUserId });
        const chat = toPublicChat(created);
        const otherUserId =
            Number(requesterId) === Number(chat.firstUserId)
                ? chat.secondUserId
                : chat.firstUserId;

        notifyChatCreated(otherUserId, chat);
        return chat;
    },

    async createMessage(chatId, data) {
        const chat = await chatRepository.getChatById(chatId);

        if (!chat) return { error: "not_found" };

        if (!isParticipant(chat, data.senderId)) return { error: "forbidden" };

        const message = await chatRepository.createMessage({
            chatId,
            senderId: data.senderId,
            content: data.content,
        });

        const recipientId =
            Number(chat.firstUserId) === Number(data.senderId)
                ? Number(chat.secondUserId)
                : Number(chat.firstUserId);

        return { message: serializeMessage(message), recipientId };
    },

    async createAttachment(chatId, { senderId, file }) {
        const chat = await chatRepository.getChatById(chatId);

        if (!chat) return { error: "not_found" };

        if (!isParticipant(chat, senderId)) return { error: "forbidden" };

        if (!file?.buffer) return { error: "bad_request" };

        const processed = await processAttachment(file);
        const message = await chatRepository.createMessage({
            chatId,
            senderId,
            content: processed.originalName,
            attachmentName: processed.originalName,
            attachmentMime: processed.mime,
            attachmentSize: processed.size,
            attachmentKind: processed.kind,
        });

        await saveAttachment(message.id, processed.buffer);

        const recipientId =
            Number(chat.firstUserId) === Number(senderId)
                ? Number(chat.secondUserId)
                : Number(chat.firstUserId);

        const serialized = serializeMessage(message);
        notifyRecipient(recipientId, serialized);

        return { message: serialized, recipientId };
    },

    async getAttachment(chatId, messageId, userId) {
        const chat = await chatRepository.getChatById(chatId);

        if (!chat) return { error: "not_found" };

        if (!isParticipant(chat, userId)) return { error: "forbidden" };

        const message = await chatRepository.getMessageById(messageId);

        if (!message || Number(message.chatId) !== Number(chatId) || !message.attachmentName) {
            return { error: "not_found" };
        }

        const buffer = await readAttachment(message.id);

        if (!buffer) return { error: "not_found" };

        return {
            buffer,
            name: message.attachmentName,
            mime: message.attachmentMime || "application/octet-stream",
        };
    },

    async getMessages(chatId, start, end, requesterId) {
        const chat = await chatRepository.getChatById(chatId);

        if (!chat) return { error: "not_found" };

        if (!isParticipant(chat, requesterId)) return { error: "forbidden" };

        if (start === end) return [];

        const messages = await chatRepository.getMessagesByRange(chatId, start, end);
        return messages.map(serializeMessage);
    },

    async getUserChats(userId, requesterId) {
        if (Number(userId) !== Number(requesterId)) {
            return { error: "forbidden" };
        }

        return chatRepository.getUserChats(userId);
    },

    async getChatById(id, requesterId) {
        const chat = await chatRepository.getChatById(id);

        if (!chat) return null;

        if (!isParticipant(chat, requesterId)) return { error: "forbidden" };

        return toPublicChat(chat);
    },
};

module.exports = chatService;
