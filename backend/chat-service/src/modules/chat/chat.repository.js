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
        return Message.findAll({
            where: {
                chatId,
            },
            order: [["id", "ASC"]],
            offset: start,
            limit: end - start,
        });
    },
});

module.exports = createChatRepository;
