const { Op } = require("sequelize");
const { lastMessagePreview } = require("../../util/messageView");

const asIdList = (value) =>
    (Array.isArray(value) ? value : [])
        .map(Number)
        .filter((id) => Number.isInteger(id) && id > 0);

const uniqueSorted = (ids) => [...new Set(asIdList(ids))].sort((left, right) => left - right);

const toPublicChat = (chat) => {
    if (!chat) return null;

    const json = typeof chat.toJSON === "function" ? chat.toJSON() : chat;

    return {
        id: json.id,
        name: json.name ?? null,
        createdBy: Number(json.createdBy),
        memberIds: uniqueSorted(json.memberIds),
        adminIds: uniqueSorted(json.adminIds),
    };
};

const createChatRepository = (Chat, Message) => ({
    async createChat(data) {
        return Chat.create(data);
    },

    async getChatById(id) {
        const chat = await Chat.findByPk(id);

        if (!chat || chat.active === false) return null;

        return toPublicChat(chat);
    },

    async getDirectChatByMemberIds(memberIds) {
        return Chat.findOne({
            where: {
                name: { [Op.is]: null },
                memberIds,
                active: true,
            },
        });
    },

    async updateChat(id, data) {
        const chat = await Chat.findByPk(id);

        if (!chat) return null;

        await chat.update(data);
        return toPublicChat(chat);
    },

    async getAttachmentMessageIds(chatId) {
        const messages = await Message.findAll({
            where: {
                chatId,
                attachmentName: { [Op.ne]: null },
            },
            attributes: ["id"],
        });

        return messages.map((message) => message.id);
    },

    async deactivateChat(id) {
        const chat = await Chat.findByPk(id);

        if (!chat) return null;

        await chat.update({ active: false });
        return toPublicChat(chat);
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
                memberIds: { [Op.contains]: [Number(userId)] },
                active: true,
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
            .sort((left, right) => {
                const leftTime = Date.parse(left.lastMessageCreatedAt ?? "") || 0;
                const rightTime = Date.parse(right.lastMessageCreatedAt ?? "") || 0;

                if (rightTime !== leftTime) {
                    return rightTime - leftTime;
                }

                return Number(right.id) - Number(left.id);
            });
    },
});

module.exports = createChatRepository;
