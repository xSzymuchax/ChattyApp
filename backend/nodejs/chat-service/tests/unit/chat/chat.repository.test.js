const createChatRepository = require("../../../src/modules/chat/chat.repository");

const model = (row) => ({
    ...row,
    toJSON() {
        return { ...row };
    },
});

describe("chat repository", () => {
    it("returns messages from the requested window in ascending id order", async () => {
        const Message = {
            findAll: jest.fn(async () => [model({ id: 3 }), model({ id: 2 })]),
        };
        const repository = createChatRepository({}, Message);

        const messages = await repository.getMessagesByRange(9, 1, 3);

        expect(Message.findAll).toHaveBeenCalledWith(expect.objectContaining({
            where: { chatId: 9 },
            offset: 1,
            limit: 2,
        }));
        expect(messages.map((message) => message.id)).toEqual([2, 3]);
    });

    it("returns an empty list without querying messages when the user has no chats", async () => {
        const Message = { findAll: jest.fn() };
        const Chat = { findAll: jest.fn(async () => []) };
        const repository = createChatRepository(Chat, Message);

        await expect(repository.getUserChats(7)).resolves.toEqual([]);
        expect(Message.findAll).not.toHaveBeenCalled();
    });

    it("attaches the last message preview and sorts newer chats first", async () => {
        const chats = [
            model({ id: 1, firstUserId: 7, secondUserId: 8 }),
            model({ id: 2, firstUserId: 7, secondUserId: 9 }),
        ];
        const Chat = {
            sequelize: { literal: (sql) => sql },
            findAll: jest.fn(async () => chats),
        };
        const Message = {
            findAll: jest.fn(async () => [
                model({
                    id: 10,
                    chatId: 1,
                    senderId: 8,
                    content: "old",
                    attachmentKind: null,
                    createdAt: "2020-01-01T00:00:00.000Z",
                }),
                model({
                    id: 11,
                    chatId: 2,
                    senderId: 9,
                    content: "photo.webp",
                    attachmentKind: "image",
                    attachmentName: "photo.webp",
                    createdAt: "2024-01-01T00:00:00.000Z",
                }),
            ]),
        };
        const repository = createChatRepository(Chat, Message);

        const result = await repository.getUserChats(7);

        expect(result.map((chat) => chat.id)).toEqual([2, 1]);
        expect(result[0]).toEqual(expect.objectContaining({
            lastMessageId: 11,
            lastMessageContent: "Image",
            lastMessageSenderId: 9,
        }));
        expect(result[1].lastMessageContent).toBe("old");
    });
});
