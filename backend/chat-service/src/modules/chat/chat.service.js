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
    return chat.firstUserId === senderId || chat.secondUserId === senderId;
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

        return chatRepository.createChat({ firstUserId, secondUserId });
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

        return { message };
    },

    async getMessages(chatId, start, end) {
        const chat = await chatRepository.getChatById(chatId);

        if (!chat) return null;

        if (start === end) return [];

        return chatRepository.getMessagesByRange(chatId, start, end);
    },

    async getUserChats(userId) {
        return chatRepository.getUserChats(userId);
    }
};

module.exports = chatService;
