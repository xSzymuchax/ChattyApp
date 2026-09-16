const { Chat, Message } = require("../../models");
const createChatRepository = require("./chat.repository");
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

const notifyChatCreated = (userId, chat) => {
    const url = process.env.REALTIME_GATEWAY_URL;

    if (!url || !userId || !chat) {
        return;
    }

    fetch(`${url}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId,
            type: "chatCreated",
            message: chat,
        }),
    }).catch(() => {});
};

const chatService = {
    async createChat(data) {
        const { firstUserId, secondUserId } = normalizeUserIds(
            data.firstUserId,
            data.secondUserId
        );

        const existingChat = await chatRepository.getChatByUserIds(
            firstUserId,
            secondUserId
        );

        if (existingChat) return null;

        const chat = await chatRepository.createChat({ firstUserId, secondUserId });
        notifyChatCreated(data.secondUserId, chat.toJSON());
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

        return { message, recipientId };
    },

    async getMessages(chatId, start, end) {
        const chat = await chatRepository.getChatById(chatId);

        if (!chat) return null;

        if (start === end) return [];

        return chatRepository.getMessagesByRange(chatId, start, end);
    },

    async getUserChats(userId) {
        return chatRepository.getUserChats(userId);
    },

    async getChatById(id) {
        return chatRepository.getChatById(id);
    },
};

module.exports = chatService;
