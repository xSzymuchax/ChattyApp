const { serializeMessage } = require("../../src/util/messageView");
const { MessageInfoResponseDto } = require("../../src/modules/chat/dto/message-info.response");

describe("MessageInfoResponseDto", () => {
    it("matches a text message exactly", () => {
        const message = serializeMessage({
            toJSON: () => ({
                id: 1,
                chatId: 1,
                senderId: 1,
                content: "Hello!",
                createdAt: "2026-09-15T15:04:00.000Z",
                updatedAt: "2026-09-15T15:04:00.000Z",
                attachmentName: null,
                attachmentMime: null,
                attachmentSize: null,
                attachmentKind: null,
            }),
        });

        expect(MessageInfoResponseDto.strict().safeParse(message).success).toBe(true);
    });

    it("matches an attachment message exactly", () => {
        const message = serializeMessage({
            toJSON: () => ({
                id: 2,
                chatId: 1,
                senderId: 1,
                content: "photo.webp",
                createdAt: "2026-09-15T15:04:00.000Z",
                updatedAt: "2026-09-15T15:04:00.000Z",
                attachmentName: "photo.webp",
                attachmentMime: "image/webp",
                attachmentSize: 48211,
                attachmentKind: "image",
            }),
        });

        expect(MessageInfoResponseDto.strict().safeParse(message).success).toBe(true);
    });
});
