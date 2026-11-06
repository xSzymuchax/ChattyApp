var mockRepository;
var mockFileStore;

jest.mock("../../../src/modules/chat/chat.repository", () => {
    mockRepository = {
        createChat: jest.fn(),
        getChatById: jest.fn(),
        getDirectChatByMemberIds: jest.fn(),
        updateChat: jest.fn(),
        getAttachmentMessageIds: jest.fn(),
        deactivateChat: jest.fn(),
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
        deleteAttachment: jest.fn(),
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

const directChat = (overrides = {}) => chatRecord({
    id: 4,
    name: null,
    createdBy: 2,
    memberIds: [2, 5],
    adminIds: [2],
    ...overrides,
});

const groupChat = (overrides = {}) => chatRecord({
    id: 4,
    name: "Team",
    createdBy: 2,
    memberIds: [2, 5, 9],
    adminIds: [2],
    ...overrides,
});

describe("ChatService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        delete process.env.REALTIME_GATEWAY_URL;
        global.fetch = jest.fn().mockResolvedValue({ ok: true });
    });

    describe("createChat", () => {
        it("rejects a requester who is not on the member list", async () => {
            const result = await chatService.createChat(
                { memberIds: [2, 5] },
                9
            );

            expect(result).toEqual({ error: "forbidden" });
            expect(mockRepository.getDirectChatByMemberIds).not.toHaveBeenCalled();
        });

        it("rejects a named pair and a group below three people", async () => {
            await expect(chatService.createChat(
                { memberIds: [2, 5], name: "Pair" },
                2
            )).resolves.toEqual({ error: "bad_request" });

            expect(mockRepository.createChat).not.toHaveBeenCalled();
        });

        it("returns null when the ordered pair already has a chat", async () => {
            mockRepository.getDirectChatByMemberIds.mockResolvedValue({ id: 1 });

            const result = await chatService.createChat(
                { memberIds: [5, 2] },
                5
            );

            expect(mockRepository.getDirectChatByMemberIds).toHaveBeenCalledWith([2, 5]);
            expect(result).toBeNull();
            expect(mockRepository.createChat).not.toHaveBeenCalled();
        });

        it("stores a sorted pair and notifies the other participant", async () => {
            process.env.REALTIME_GATEWAY_URL = "http://realtime.test";
            const created = directChat({ id: 4, createdBy: 5, adminIds: [5] });
            mockRepository.getDirectChatByMemberIds.mockResolvedValue(null);
            mockRepository.createChat.mockResolvedValue(created);

            const result = await chatService.createChat(
                { memberIds: [5, 2] },
                5
            );

            expect(mockRepository.createChat).toHaveBeenCalledWith({
                memberIds: [2, 5],
                adminIds: [5],
                name: null,
                createdBy: 5,
                active: true,
            });
            expect(fetch).toHaveBeenCalledWith("http://realtime.test/notify", expect.objectContaining({
                method: "POST",
                body: JSON.stringify({
                    userId: 2,
                    type: "chatCreated",
                    message: {
                        id: 4,
                        name: null,
                        createdBy: 5,
                        memberIds: [2, 5],
                        adminIds: [5],
                    },
                }),
            }));
            expect(result.memberIds).toEqual([2, 5]);
        });

        it("creates a group and notifies every member except the creator", async () => {
            process.env.REALTIME_GATEWAY_URL = "http://realtime.test";
            mockRepository.createChat.mockResolvedValue(groupChat());

            const result = await chatService.createChat(
                { memberIds: [9, 2, 5], name: "  Team  " },
                2
            );

            expect(mockRepository.getDirectChatByMemberIds).not.toHaveBeenCalled();
            expect(mockRepository.createChat).toHaveBeenCalledWith({
                memberIds: [2, 5, 9],
                adminIds: [2],
                name: "Team",
                createdBy: 2,
                active: true,
            });
            expect(fetch).toHaveBeenCalledTimes(2);
            expect(result.name).toBe("Team");
        });

        it("still returns the chat when the realtime notify fails", async () => {
            process.env.REALTIME_GATEWAY_URL = "http://realtime.test";
            const created = directChat({ id: 4 });
            mockRepository.getDirectChatByMemberIds.mockResolvedValue(null);
            mockRepository.createChat.mockResolvedValue(created);
            fetch.mockRejectedValue(new Error("down"));

            await expect(chatService.createChat(
                { memberIds: [2, 5] },
                2
            )).resolves.toEqual({
                id: 4,
                name: null,
                createdBy: 2,
                memberIds: [2, 5],
                adminIds: [2],
            });
        });
    });

    describe("createMessage", () => {
        it("returns not_found and forbidden before writing", async () => {
            mockRepository.getChatById.mockResolvedValue(null);
            await expect(chatService.createMessage(4, { senderId: 2, content: "hi" }))
                .resolves.toEqual({ error: "not_found" });

            mockRepository.getChatById.mockResolvedValue(directChat());
            await expect(chatService.createMessage(4, { senderId: 9, content: "hi" }))
                .resolves.toEqual({ error: "forbidden" });
            expect(mockRepository.createMessage).not.toHaveBeenCalled();
        });

        it("returns the serialized message and every other member", async () => {
            mockRepository.getChatById.mockResolvedValue(groupChat());
            mockRepository.createMessage.mockResolvedValue(messageRecord({
                id: 8,
                chatId: 4,
                senderId: 5,
                content: "hi",
            }));

            const result = await chatService.createMessage(4, { senderId: 5, content: "hi" });

            expect(result.recipientIds).toEqual([2, 9]);
            expect(result.message).toEqual(expect.objectContaining({
                id: 8,
                content: "hi",
                attachment: null,
            }));
        });
    });

    describe("createAttachment", () => {
        const chat = directChat();

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

        it("stores the processed file and notifies every other member", async () => {
            process.env.REALTIME_GATEWAY_URL = "http://realtime.test";
            mockRepository.getChatById.mockResolvedValue(groupChat());
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
            expect(result.recipientIds).toEqual([5, 9]);
            expect(result.message.attachment.kind).toBe("image");
            expect(fetch).toHaveBeenCalledTimes(2);
        });
    });

    describe("getAttachment", () => {
        const chat = directChat();

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

    describe("membership", () => {
        const group = () => groupChat();

        it("lets a member add someone and refuses an outsider", async () => {
            process.env.REALTIME_GATEWAY_URL = "http://realtime.test";
            mockRepository.getChatById.mockResolvedValue(group());
            mockRepository.updateChat.mockResolvedValue(groupChat({
                memberIds: [2, 5, 7, 9],
            }));

            const added = await chatService.addMember(4, 5, 7);

            expect(added.memberIds).toEqual([2, 5, 7, 9]);
            expect(mockRepository.updateChat).toHaveBeenCalledWith(4, {
                memberIds: [2, 5, 7, 9],
            });
            expect(fetch).toHaveBeenCalledWith(
                "http://realtime.test/notify",
                expect.objectContaining({
                    body: expect.stringContaining("\"type\":\"chatCreated\""),
                })
            );

            mockRepository.getChatById.mockResolvedValue(group());
            await expect(chatService.addMember(4, 8, 7)).resolves.toEqual({ error: "forbidden" });
            await expect(chatService.addMember(4, 5, 9)).resolves.toEqual({ error: "conflict" });
        });

        it("rejects membership changes on a direct chat", async () => {
            mockRepository.getChatById.mockResolvedValue(directChat());

            await expect(chatService.addMember(4, 2, 7)).resolves.toEqual({ error: "bad_request" });
            await expect(chatService.removeMember(4, 2, 5)).resolves.toEqual({ error: "bad_request" });
            await expect(chatService.grantAdmin(4, 2, 5)).resolves.toEqual({ error: "bad_request" });
            await expect(chatService.deleteChat(4, 2)).resolves.toEqual({ error: "bad_request" });
        });

        it("lets anyone leave and only an admin remove someone else", async () => {
            mockRepository.getChatById.mockResolvedValue(group());
            await expect(chatService.removeMember(4, 5, 9)).resolves.toEqual({ error: "forbidden" });

            mockRepository.updateChat.mockResolvedValue(groupChat({
                memberIds: [2, 9],
                adminIds: [2],
            }));
            const left = await chatService.removeMember(4, 5, 5);

            expect(left.memberIds).toEqual([2, 9]);
            expect(mockRepository.updateChat).toHaveBeenCalledWith(4, {
                memberIds: [2, 9],
                adminIds: [2],
            });
        });

        it("lets an admin grant creator permissions, then that member can remove and delete", async () => {
            mockRepository.getChatById.mockResolvedValue(group());
            mockRepository.updateChat.mockResolvedValue(groupChat({ adminIds: [2, 5] }));

            const granted = await chatService.grantAdmin(4, 2, 5);

            expect(granted.adminIds).toEqual([2, 5]);
            await expect(chatService.grantAdmin(4, 9, 5)).resolves.toEqual({ error: "forbidden" });

            mockRepository.getChatById.mockResolvedValue(groupChat({ adminIds: [2, 5] }));
            mockRepository.updateChat.mockResolvedValue(groupChat({
                memberIds: [2, 5],
                adminIds: [5],
            }));
            const kicked = await chatService.removeMember(4, 5, 9);

            expect(kicked.memberIds).toEqual([2, 5]);

            mockRepository.getChatById.mockResolvedValue(groupChat({ adminIds: [2, 5] }));
            await expect(chatService.deleteChat(4, 9)).resolves.toEqual({ error: "forbidden" });

            const deleted = await chatService.deleteChat(4, 5);

            expect(deleted).toEqual({ id: 4 });
            expect(mockRepository.deactivateChat).toHaveBeenCalledWith(4);
            expect(mockFileStore.deleteAttachment).not.toHaveBeenCalled();
        });
    });

    describe("reads", () => {
        const chat = directChat();

        it("returns an empty page when the range is empty", async () => {
            mockRepository.getChatById.mockResolvedValue(chat);

            await expect(chatService.getMessages(4, 2, 2, 2)).resolves.toEqual([]);
            expect(mockRepository.getMessagesByRange).not.toHaveBeenCalled();
        });

        it("returns the requester's chats", async () => {
            mockRepository.getUserChats.mockResolvedValue([]);

            await expect(chatService.getUserChats(5)).resolves.toEqual([]);
            expect(mockRepository.getUserChats).toHaveBeenCalledWith(5);
        });

        it("returns null for a missing chat and forbidden for an outsider", async () => {
            mockRepository.getChatById.mockResolvedValueOnce(null);
            await expect(chatService.getChatById(4, 2)).resolves.toBeNull();

            mockRepository.getChatById.mockResolvedValue(chat);
            await expect(chatService.getChatById(4, 9)).resolves.toEqual({ error: "forbidden" });
        });
    });
});
