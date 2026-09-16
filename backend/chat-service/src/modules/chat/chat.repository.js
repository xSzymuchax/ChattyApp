const {Op} = require('sequelize');

const createChatRepository = (Chat, Message) => ({
    async createChat(data) {
        return Chat.create(data);
    },

    async getChatById(id) {
        return Chat.findByPk(id);
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

    async getMessagesByRange(chatId, start, end) {
        const messages = await Message.findAll({
            where: {
                chatId,
            },
            order: [["id", "DESC"]],
            offset: start-1,
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
                const json = chat.toJSON();
                const lastMessage = lastMessageByChatId.get(Number(chat.id));

                json.lastMessageId = lastMessage?.id ?? null;
                json.lastMessageContent = lastMessage?.content ?? null;
                json.lastMessageSenderId = lastMessage?.senderId ?? null;
                json.lastMessageCreatedAt = lastMessage?.createdAt ?? null;

                return json;
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
