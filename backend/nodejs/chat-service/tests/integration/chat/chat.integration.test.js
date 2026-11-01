process.env.JWT_SECRET = "integration-secret";
delete process.env.REALTIME_GATEWAY_URL;

var mockRepository;

jest.mock("../../../src/modules/chat/chat.repository", () => {
    const chats = [];
    const messages = [];
    let nextChatId = 1;
    let nextMessageId = 1;

    const asModel = (row) => ({
        ...row,
        toJSON() {
            return { ...row };
        },
    });

    mockRepository = {
        async createChat(data) {
            const row = { id: nextChatId, ...data };
            nextChatId += 1;
            chats.push(row);
            return asModel(row);
        },
        async getChatById(id) {
            const row = chats.find((chat) => chat.id === Number(id));
            return row ? asModel(row) : null;
        },
        async getChatByUserIds(firstUserId, secondUserId) {
            const row = chats.find((chat) =>
                chat.firstUserId === firstUserId && chat.secondUserId === secondUserId
            );
            return row ? asModel(row) : null;
        },
        async createMessage(data) {
            const row = {
                id: nextMessageId,
                createdAt: "2024-01-01T00:00:00.000Z",
                updatedAt: "2024-01-01T00:00:00.000Z",
                attachmentName: null,
                ...data,
            };
            nextMessageId += 1;
            messages.push(row);
            return asModel(row);
        },
        async getMessageById(id) {
            return messages.find((message) => message.id === Number(id)) ?? null;
        },
        async getMessagesByRange(chatId, start, end) {
            return messages
                .filter((message) => message.chatId === chatId)
                .sort((left, right) => right.id - left.id)
                .slice(start, end)
                .reverse()
                .map(asModel);
        },
        async getUserChats(userId) {
            return chats
                .filter((chat) => chat.firstUserId === Number(userId) || chat.secondUserId === Number(userId))
                .map(asModel);
        },
        reset() {
            chats.length = 0;
            messages.length = 0;
            nextChatId = 1;
            nextMessageId = 1;
        },
    };

    return jest.fn(() => mockRepository);
});

const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../../../src/app");

const tokenFor = (userId) =>
    jwt.sign({ userId, username: `user-${userId}` }, process.env.JWT_SECRET);

const auth = (userId) => ({ Authorization: `Bearer ${tokenFor(userId)}` });

describe("chat integration", () => {
    beforeEach(() => {
        jest.spyOn(console, "log").mockImplementation(() => {});
        mockRepository.reset();
    });

    afterEach(() => {
        console.log.mockRestore();
    });

    it("creates a chat, exchanges a message, and lists it for both participants", async () => {
        const created = await request(app)
            .post("/")
            .set(auth(5))
            .send({ firstUserId: 5, secondUserId: 2 });

        expect(created.status).toBe(200);
        expect(created.body).toEqual(expect.objectContaining({
            id: 1,
            firstUserId: 2,
            secondUserId: 5,
        }));

        const duplicate = await request(app)
            .post("/")
            .set(auth(2))
            .send({ firstUserId: 2, secondUserId: 5 });
        expect(duplicate.status).toBe(409);

        const outsider = await request(app)
            .post("/")
            .set(auth(9))
            .send({ firstUserId: 2, secondUserId: 5 });
        expect(outsider.status).toBe(403);

        const sent = await request(app)
            .post("/1/message")
            .set(auth(2))
            .send({ content: "hello" });

        expect(sent.status).toBe(200);
        expect(sent.body.recipientId).toBe(5);
        expect(sent.body.message.content).toBe("hello");

        const denied = await request(app)
            .post("/1/message")
            .set(auth(9))
            .send({ content: "nope" });
        expect(denied.status).toBe(403);

        const page = await request(app)
            .post("/1/messages")
            .set(auth(5))
            .send({ start: 0, end: 10 });

        expect(page.status).toBe(200);
        expect(page.body.map((message) => message.content)).toEqual(["hello"]);

        const visible = await request(app).get("/1").set(auth(5));
        expect(visible.status).toBe(200);
        expect(visible.body.id).toBe(1);

        const hidden = await request(app).get("/1").set(auth(9));
        expect(hidden.status).toBe(403);

        const missing = await request(app).get("/99").set(auth(5));
        expect(missing.status).toBe(404);
    });

    it("rejects an unauthenticated request before the service runs", async () => {
        const response = await request(app).get("/1");

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: "Invalid or expired token." });
    });
});
