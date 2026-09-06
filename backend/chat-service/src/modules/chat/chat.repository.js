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
        const sequelize = Chat.sequelize;

        return Chat.findAll({
            where: {
                [Op.or]: [
                    { firstUserId: userId },
                    { secondUserId: userId }
                ]
            },
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT MAX("m"."id")
                            FROM "messages" AS "m"
                            WHERE "m"."chatId" = "Chat"."id"
                        )`),
                        "lastMessageId",
                    ],
                    [
                        sequelize.literal(`(
                            SELECT "m"."content"
                            FROM "messages" AS "m"
                            WHERE "m"."chatId" = "Chat"."id"
                            ORDER BY "m"."id" DESC
                            LIMIT 1
                        )`),
                        "lastMessageContent",
                    ],
                    [
                        sequelize.literal(`(
                            SELECT "m"."senderId"
                            FROM "messages" AS "m"
                            WHERE "m"."chatId" = "Chat"."id"
                            ORDER BY "m"."id" DESC
                            LIMIT 1
                        )`),
                        "lastMessageSenderId",
                    ],
                ],
            },
            order: [
                [sequelize.literal('"lastMessageId"'), "DESC NULLS LAST"],
                ["id", "DESC"],
            ],
        });
    }
});

module.exports = createChatRepository;
