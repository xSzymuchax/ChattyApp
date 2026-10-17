const {Op} = require('sequelize');
const { lastMessagePreview } = require("../../util/messageView");

const toPublicChat = (chat) => {
    if (!chat) return null;

    const json = typeof chat.toJSON === "function" ? chat.toJSON() : chat;

    return {
        id: json.id,
        firstUserId: json.firstUserId,
        secondUserId: json.secondUserId,
    };
};

const createChatRepository = (Chat, Message) => ({
    async createChat(data) {
        return Chat.create(data);
    },

    async getChatById(id) {
        return toPublicChat(await Chat.findByPk(id));
    },

    async getChatByUserIds(firstUserId, secondUserId) {
        return Chat.findOne({
            where: {
                firstUserId,
                secondUserId,
            },
        });
    },

    async createMessage(data) {
        return Message.create(data);
    },

    async getMessageById(id) {
        return Message.findByPk(id);
    },

    async getMessagesByRange(chatId, start, end) {
        const messages = await Message.findAll({
            where: {
                chatId,
            },
            order: [["id", "DESC"]],
            offset: start,
            limit: end - start,
        });

        return messages.reverse();
    },

    async getUserChats(userId) {
        const chats = await Chat.findAll({
            where: {
                [Op.or]: [
                    { firstUserId: userId },
                    { secondUserId: userId }
                ]
            },
        });

        if (chats.length === 0) {
            return [];
        }

        const chatIds = chats.map((chat) => Number(chat.id));
        const lastMessages = await Message.findAll({
            where: {
                id: {
                    [Op.in]: Chat.sequelize.literal(
                        `(SELECT MAX(id) FROM messages WHERE "chatId" IN (${chatIds.join(",")}) GROUP BY "chatId")`
                    ),
                },
            },
        });

        const lastMessageByChatId = new Map(
            lastMessages.map((message) => [Number(message.chatId), message])
        );

        return chats
            .map((chat) => {
                const lastMessage = lastMessageByChatId.get(Number(chat.id));

                return {
                    ...toPublicChat(chat),
                    lastMessageId: lastMessage?.id ?? null,
                    lastMessageContent: lastMessagePreview(lastMessage),
                    lastMessageSenderId: lastMessage?.senderId ?? null,
                    lastMessageCreatedAt: lastMessage?.createdAt ?? null,
                };
            })
            .sort((a, b) => {
                const aTime = Date.parse(a.lastMessageCreatedAt ?? "") || 0;
                const bTime = Date.parse(b.lastMessageCreatedAt ?? "") || 0;

                if (bTime !== aTime) {
                    return bTime - aTime;
                }

                return Number(b.id) - Number(a.id);
            });
    }
});

module.exports = createChatRepository;
