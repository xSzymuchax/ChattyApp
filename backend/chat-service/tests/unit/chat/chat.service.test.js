var mockRepository;
var mockFileStore;

jest.mock("../../../src/modules/chat/chat.repository", () => {
    mockRepository = {
        createChat: jest.fn(),
        getChatById: jest.fn(),
        getChatByUserIds: jest.fn(),
        createMessage: jest.fn(),
        getMessageById: jest.fn(),
        getMessagesByRange: jest.fn(),
        getUserChats: jest.fn(),
    };

    return jest.fn(() => mockRepository);
});

jest.mock("../../../src/util/fileStore", () => {
    mockFileStore = {
        saveAttachment: jest.fn(),
        readAttachment: jest.fn(),
    };

    return mockFileStore;
});

jest.mock("../../../src/util/attachment", () => ({
    processAttachment: jest.fn(),
}));

const { processAttachment } = require("../../../src/util/attachment");
const chatService = require("../../../src/modules/chat/chat.service");

const chatRecord = (fields) => ({
    ...fields,
    toJSON() {
        return { ...fields };
    },
});

const messageRecord = (fields) => ({
    attachmentName: null,
    createdAt: "now",
    updatedAt: "now",
    ...fields,
    toJSON() {
        const { toJSON, ...plain } = this;
        return plain;
    },
});

describe("ChatService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        delete process.env.REALTIME_GATEWAY_URL;
        global.fetch = jest.fn().mockResolvedValue({ ok: true });
    });

    describe("createChat", () => {
        it("rejects a requester who is not one of the two users", async () => {
            const result = await chatService.createChat(
                { firstUserId: 2, secondUserId: 5 },
                9
            );

            expect(result).toEqual({ error: "forbidden" });
            expect(mockRepository.getChatByUserIds).not.toHaveBeenCalled();
        });

        it("returns null when the ordered pair already has a chat", async () => {
            mockRepository.getChatByUserIds.mockResolvedValue({ id: 1 });

            const result = await chatService.createChat(
                { firstUserId: 5, secondUserId: 2 },
                5
            );

            expect(mockRepository.getChatByUserIds).toHaveBeenCalledWith(2, 5);
            expect(result).toBeNull();
            expect(mockRepository.createChat).not.toHaveBeenCalled();
        });

        it("stores the lower id first and notifies the other participant", async () => {
            process.env.REALTIME_GATEWAY_URL = "http://realtime.test";
            const created = chatRecord({ id: 4, firstUserId: 2, secondUserId: 5 });
            mockRepository.getChatByUserIds.mockResolvedValue(null);
            mockRepository.createChat.mockResolvedValue(created);

            const result = await chatService.createChat(
                { firstUserId: 5, secondUserId: 2 },
                5
            );

            expect(mockRepository.createChat).toHaveBeenCalledWith({ firstUserId: 2, secondUserId: 5 });
            expect(fetch).toHaveBeenCalledWith("http://realtime.test/notify", expect.objectContaining({
                method: "POST",
                body: JSON.stringify({
                    userId: 2,
                    type: "chatCreated",
                    message: { id: 4, firstUserId: 2, secondUserId: 5 },
                }),
            }));
            expect(result).toEqual({ id: 4, firstUserId: 2, secondUserId: 5 });
        });

        it("still returns the chat when the realtime notify fails", async () => {
            process.env.REALTIME_GATEWAY_URL = "http://realtime.test";
            const created = chatRecord({ id: 4, firstUserId: 2, secondUserId: 5 });
            mockRepository.getChatByUserIds.mockResolvedValue(null);
            mockRepository.createChat.mockResolvedValue(created);
            fetch.mockRejectedValue(new Error("down"));

            await expect(chatService.createChat(
                { firstUserId: 2, secondUserId: 5 },
                2
            )).resolves.toEqual({ id: 4, firstUserId: 2, secondUserId: 5 });
            expect(fetch).toHaveBeenCalledWith("http://realtime.test/notify", expect.objectContaining({
                body: JSON.stringify({
                    userId: 5,
                    type: "chatCreated",
                    message: { id: 4, firstUserId: 2, secondUserId: 5 },
                }),
            }));
        });
    });

    describe("createMessage", () => {
        it("returns not_found and forbidden before writing", async () => {
            mockRepository.getChatById.mockResolvedValue(null);
            await expect(chatService.createMessage(4, { senderId: 2, content: "hi" }))
                .resolves.toEqual({ error: "not_found" });

            mockRepository.getChatById.mockResolvedValue(chatRecord({
                id: 4,
                firstUserId: 2,
                secondUserId: 5,
            }));
            await expect(chatService.createMessage(4, { senderId: 9, content: "hi" }))
                .resolves.toEqual({ error: "forbidden" });
            expect(mockRepository.createMessage).not.toHaveBeenCalled();
        });

        it("returns the serialized message and the other participant", async () => {
            mockRepository.getChatById.mockResolvedValue(chatRecord({
                id: 4,
                firstUserId: 2,
                secondUserId: 5,
            }));
            mockRepository.createMessage.mockResolvedValue(messageRecord({
                id: 8,
                chatId: 4,
                senderId: 5,
                content: "hi",
            }));

            const result = await chatService.createMessage(4, { senderId: 5, content: "hi" });

            expect(result.recipientId).toBe(2);
            expect(result.message).toEqual(expect.objectContaining({
                id: 8,
                content: "hi",
                attachment: null,
            }));
        });
    });

    describe("createAttachment", () => {
        const chat = chatRecord({ id: 4, firstUserId: 2, secondUserId: 5 });

        it("rejects a missing chat, an outsider, and a file without bytes", async () => {
            mockRepository.getChatById.mockResolvedValueOnce(null);
            await expect(chatService.createAttachment(4, { senderId: 2, file: { buffer: Buffer.from("a") } }))
                .resolves.toEqual({ error: "not_found" });

            mockRepository.getChatById.mockResolvedValue(chat);
            await expect(chatService.createAttachment(4, { senderId: 9, file: { buffer: Buffer.from("a") } }))
                .resolves.toEqual({ error: "forbidden" });
            await expect(chatService.createAttachment(4, { senderId: 2, file: {} }))
                .resolves.toEqual({ error: "bad_request" });
        });

        it("stores the processed file and notifies the recipient", async () => {
            process.env.REALTIME_GATEWAY_URL = "http://realtime.test";
            mockRepository.getChatById.mockResolvedValue(chat);
            processAttachment.mockResolvedValue({
                buffer: Buffer.from("webp"),
                originalName: "pic.webp",
                mime: "image/webp",
                size: 4,
                kind: "image",
            });
            mockRepository.createMessage.mockResolvedValue(messageRecord({
                id: 15,
                chatId: 4,
                senderId: 2,
                content: "pic.webp",
                attachmentName: "pic.webp",
                attachmentMime: "image/webp",
                attachmentSize: 4,
                attachmentKind: "image",
            }));

            const result = await chatService.createAttachment(4, {
                senderId: 2,
                file: { buffer: Buffer.from("png"), originalname: "pic.png" },
            });

            expect(mockFileStore.saveAttachment).toHaveBeenCalledWith(15, Buffer.from("webp"));
            expect(result.recipientId).toBe(5);
            expect(result.message.attachment.kind).toBe("image");
            expect(fetch).toHaveBeenCalledWith(
                "http://realtime.test/notify",
                expect.objectContaining({
                    body: expect.stringContaining("\"type\":\"message\""),
                })
            );
        });
    });

    describe("getAttachment", () => {
        const chat = chatRecord({ id: 4, firstUserId: 2, secondUserId: 5 });

        it("hides messages from another chat and missing files", async () => {
            mockRepository.getChatById.mockResolvedValue(chat);
            mockRepository.getMessageById.mockResolvedValue({
                id: 3,
                chatId: 9,
                attachmentName: "a.txt",
            });

            await expect(chatService.getAttachment(4, 3, 2)).resolves.toEqual({ error: "not_found" });

            mockRepository.getMessageById.mockResolvedValue({
                id: 3,
                chatId: 4,
                attachmentName: "a.txt",
                attachmentMime: "text/plain",
            });
            mockFileStore.readAttachment.mockResolvedValue(null);

            await expect(chatService.getAttachment(4, 3, 2)).resolves.toEqual({ error: "not_found" });
        });

        it("returns the stored bytes for a participant", async () => {
            mockRepository.getChatById.mockResolvedValue(chat);
            mockRepository.getMessageById.mockResolvedValue({
                id: 3,
                chatId: 4,
                attachmentName: "a.txt",
                attachmentMime: null,
            });
            mockFileStore.readAttachment.mockResolvedValue(Buffer.from("abc"));

            await expect(chatService.getAttachment(4, 3, 5)).resolves.toEqual({
                buffer: Buffer.from("abc"),
                name: "a.txt",
                mime: "application/octet-stream",
            });
        });
    });

    describe("reads", () => {
        const chat = chatRecord({ id: 4, firstUserId: 2, secondUserId: 5 });

        it("returns an empty page when the range is empty", async () => {
            mockRepository.getChatById.mockResolvedValue(chat);

            await expect(chatService.getMessages(4, 2, 2, 2)).resolves.toEqual([]);
            expect(mockRepository.getMessagesByRange).not.toHaveBeenCalled();
        });

        it("forbids reading another user's chat list", async () => {
            await expect(chatService.getUserChats(5, 2)).resolves.toEqual({ error: "forbidden" });
            expect(mockRepository.getUserChats).not.toHaveBeenCalled();
        });

        it("returns null for a missing chat and forbidden for an outsider", async () => {
            mockRepository.getChatById.mockResolvedValueOnce(null);
            await expect(chatService.getChatById(4, 2)).resolves.toBeNull();

            mockRepository.getChatById.mockResolvedValue(chat);
            await expect(chatService.getChatById(4, 9)).resolves.toEqual({ error: "forbidden" });
        });
    });
});
