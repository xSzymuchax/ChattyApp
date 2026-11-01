const createChatRepository = require("../../src/modules/chat/chat.repository");
const { ChatInfoResponseDto } = require("../../src/modules/chat/dto/chat-info.response");
const { ChatListResponseDto } = require("../../src/modules/chat/dto/chat-list.response");

describe("chat response DTOs", () => {
    it("matches a chat loaded by id exactly", async () => {
        const Chat = {
            findByPk: async () => ({
                toJSON: () => ({
                    id: 1,
                    firstUserId: 1,
                    secondUserId: 2,
                    createdAt: "2026-01-01T00:00:00.000Z",
                    updatedAt: "2026-01-01T00:00:00.000Z",
                }),
            }),
        };
        const repository = createChatRepository(Chat, {});
        const chat = await repository.getChatById(1);

        expect(ChatInfoResponseDto.strict().safeParse(chat).success).toBe(true);
    });

    it("matches a user's chat list exactly", async () => {
        const Chat = {
            sequelize: { literal: (value) => value },
            findAll: async () => [{
                id: 1,
                toJSON: () => ({
                    id: 1,
                    firstUserId: 1,
                    secondUserId: 2,
                    createdAt: "2026-01-01T00:00:00.000Z",
                    updatedAt: "2026-01-02T00:00:00.000Z",
                }),
            }],
        };
        const Message = {
            findAll: async () => [{
                id: 12,
                chatId: 1,
                senderId: 1,
                content: "Hello!",
                attachmentKind: null,
                attachmentName: null,
                createdAt: "2026-09-15T15:04:00.000Z",
            }],
        };
        const repository = createChatRepository(Chat, Message);
        const chats = JSON.parse(JSON.stringify(await repository.getUserChats(1)));
        const parsed = ChatListResponseDto.safeParse(chats);

        expect(parsed.success).toBe(true);
        expect(chats).toEqual(parsed.success ? parsed.data : chats);
    });
});
