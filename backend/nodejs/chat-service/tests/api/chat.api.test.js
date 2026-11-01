process.env.JWT_SECRET = "api-test-secret";

jest.mock("../../src/modules/chat/chat.service", () => ({
    createChat: jest.fn(),
    createMessage: jest.fn(),
    createAttachment: jest.fn(),
    getAttachment: jest.fn(),
    getMessages: jest.fn(),
    getUserChats: jest.fn(),
    getChatById: jest.fn(),
}));

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../../src/app");
const chatService = require("../../src/modules/chat/chat.service");

const SECRET = process.env.JWT_SECRET;

const sign = (payload = { userId: 7, username: "ada" }) =>
    jwt.sign(payload, SECRET, { expiresIn: "1h" });

const authed = (req, payload) =>
    req.set("Authorization", `Bearer ${sign(payload)}`);

const asBuffer = (req) => req.buffer(true).parse((res, callback) => {
    const chunks = [];
    res.on("data", (chunk) => chunks.push(chunk));
    res.on("end", () => callback(null, Buffer.concat(chunks)));
});

const resetMocks = () => {
    for (const value of Object.values(chatService)) {
        if (jest.isMockFunction(value))
            value.mockReset();
    }
};

describe("Chat API", () => {
    beforeEach(() => {
        jest.spyOn(console, "log").mockImplementation(() => {});
        resetMocks();
    });

    afterEach(() => {
        console.log.mockRestore();
    });

    describe.each([
        ["get", "/4"],
        ["get", "/4/messages/8/attachment"],
        ["get", "/userChats/4"],
        ["post", "/"],
        ["post", "/4/message"],
        ["post", "/4/messages"],
        ["post", "/4/attachment"],
    ])("%s %s", (method, path) => {
        it("returns 401 when no token is sent", async () => {
            const response = await request(app)[method](path);

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ message: "Invalid or expired token." });
        });
    });

    describe("GET /:id", () => {
        it.each([
            ["Token abc"],
            ["bearer abc"],
            ["Bearer"],
            ["Bearer "],
        ])("returns 401 for authorization %j", async (header) => {
            const response = await request(app).get("/4").set("Authorization", header);

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ message: "Invalid or expired token." });
        });

        it("returns 401 for an expired token", async () => {
            const token = jwt.sign({ userId: 7, username: "ada", exp: 1 }, SECRET);

            const response = await request(app)
                .get("/4")
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ message: "Invalid or expired token." });
        });

        it("returns the chat for a participant", async () => {
            const chat = { id: 4, firstUserId: 7, secondUserId: 9 };
            chatService.getChatById.mockResolvedValue(chat);

            const response = await authed(request(app).get("/4"));

            expect(response.status).toBe(200);
            expect(response.body).toEqual(chat);
            expect(chatService.getChatById).toHaveBeenCalledWith(4, 7);
        });

        it.each(["0", "-1", "1.5", "abc"])("returns 400 for id %s", async (id) => {
            const response = await authed(request(app).get(`/${id}`));

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: "Bad request." });
            expect(chatService.getChatById).not.toHaveBeenCalled();
        });

        it("returns 400 when the token has no positive user id", async () => {
            const response = await authed(request(app).get("/4"), { username: "ada" });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: "Bad request." });
            expect(chatService.getChatById).not.toHaveBeenCalled();
        });

        it("accepts a padded numeric id", async () => {
            chatService.getChatById.mockResolvedValue({ id: 4 });

            const response = await authed(request(app).get("/ 4 "));

            expect(response.status).toBe(200);
            expect(chatService.getChatById).toHaveBeenCalledWith(4, 7);
        });

        it("returns a documented status when the caller is not a participant", async () => {
            chatService.getChatById.mockResolvedValue({ error: "forbidden" });

            const response = await authed(request(app).get("/4"));

            expect(response.status).toBe(403);
            expect(response.body).toEqual({ message: "Access denied." });
        });

        it("returns 404 when the chat does not exist", async () => {
            chatService.getChatById.mockResolvedValue(null);

            const response = await authed(request(app).get("/4"));

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: "Chat not found." });
        });

        it("returns 500 without leaking the internal error", async () => {
            chatService.getChatById.mockRejectedValue(new Error("row leaked"));

            const response = await authed(request(app).get("/4"));

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Internal server error." });
            expect(JSON.stringify(response.body)).not.toContain("leaked");
        });
    });

    describe("GET /userChats/:id", () => {
        it("returns the caller's chats", async () => {
            const chats = [{ id: 4 }];
            chatService.getUserChats.mockResolvedValue(chats);

            const response = await authed(request(app).get("/userChats/7"));

            expect(response.status).toBe(200);
            expect(response.body).toEqual(chats);
            expect(chatService.getUserChats).toHaveBeenCalledWith(7, 7);
        });

        it("passes a different path id and requester id to the service", async () => {
            chatService.getUserChats.mockResolvedValue([]);

            const response = await authed(request(app).get("/userChats/9"));

            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
            expect(chatService.getUserChats).toHaveBeenCalledWith(9, 7);
        });

        it.each(["0", "-3", "nope"])("returns 400 for id %s", async (id) => {
            const response = await authed(request(app).get(`/userChats/${id}`));

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: "Bad request." });
            expect(chatService.getUserChats).not.toHaveBeenCalled();
        });

        it("returns a documented status when the caller asks for another user's chats", async () => {
            chatService.getUserChats.mockResolvedValue({ error: "forbidden" });

            const response = await authed(request(app).get("/userChats/9"));

            expect(response.status).toBe(403);
            expect(response.body).toEqual({ message: "Access denied." });
        });

        it("returns 500 without leaking the internal error", async () => {
            chatService.getUserChats.mockRejectedValue(new Error("list leaked"));

            const response = await authed(request(app).get("/userChats/7"));

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Internal server error." });
            expect(JSON.stringify(response.body)).not.toContain("leaked");
        });
    });

    describe("POST /", () => {
        it("creates a chat between two users", async () => {
            const chat = { id: 4, firstUserId: 3, secondUserId: 8 };
            chatService.createChat.mockResolvedValue(chat);

            const response = await authed(request(app).post("/")).send({
                firstUserId: 3,
                secondUserId: 8,
            });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(chat);
            expect(chatService.createChat).toHaveBeenCalledWith(
                { firstUserId: 3, secondUserId: 8 },
                7
            );
        });

        it.each([
            [{}, "both ids are missing"],
            [{ firstUserId: 1 }, "the second id is missing"],
            [{ secondUserId: 2 }, "the first id is missing"],
            [{ firstUserId: "3", secondUserId: 8 }, "an id is a string"],
            [{ firstUserId: 1.5, secondUserId: 2 }, "an id is fractional"],
            [{ firstUserId: "abc", secondUserId: 2 }, "an id is not numeric"],
        ])("returns 400 when %j (%s)", async (body) => {
            chatService.createChat.mockResolvedValue({
                id: 4,
                firstUserId: 3,
                secondUserId: 8,
            });

            const response = await authed(request(app).post("/")).send(body);

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: "Bad request." });
            expect(chatService.createChat).not.toHaveBeenCalled();
        });

        it("returns 400 when the token has a fractional user id", async () => {
            const response = await authed(
                request(app).post("/"),
                { userId: 7.5, username: "ada" }
            ).send({ firstUserId: 1, secondUserId: 2 });

            expect(response.status).toBe(400);
            expect(chatService.createChat).not.toHaveBeenCalled();
        });

        it("returns a documented status when the caller is not one of the users", async () => {
            chatService.createChat.mockResolvedValue({ error: "forbidden" });

            const response = await authed(request(app).post("/")).send({
                firstUserId: 1,
                secondUserId: 2,
            });

            expect(response.status).toBe(403);
            expect(response.body).toEqual({ message: "Access denied." });
        });

        it("returns 409 when the chat already exists", async () => {
            chatService.createChat.mockResolvedValue(null);

            const response = await authed(request(app).post("/")).send({
                firstUserId: 7,
                secondUserId: 9,
            });

            expect(response.status).toBe(409);
            expect(response.body).toEqual({
                message: "Chat between those users already exists.",
            });
        });

        it("rejects a JSON null body before the controller", async () => {
            const response = await authed(request(app).post("/"))
                .set("Content-Type", "application/json")
                .send("null");

            expect(response.status).toBe(400);
            expect(chatService.createChat).not.toHaveBeenCalled();
        });

        it("returns 500 without leaking the internal error", async () => {
            chatService.createChat.mockRejectedValue(new Error("insert leaked"));

            const response = await authed(request(app).post("/")).send({
                firstUserId: 7,
                secondUserId: 9,
            });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Internal server error." });
            expect(JSON.stringify(response.body)).not.toContain("leaked");
        });
    });

    describe("POST /:id/message", () => {
        it("creates a message when the body has only content", async () => {
            chatService.createMessage.mockResolvedValue({
                message: {
                    id: 11,
                    chatId: 4,
                    senderId: 7,
                    content: "hi",
                    attachment: null,
                },
                recipientId: 9,
            });

            const response = await authed(request(app).post("/4/message")).send({
                content: "hi",
            });

            expect(response.status).toBe(200);
            expect(response.body.message.senderId).toBe(7);
            expect(chatService.createMessage).toHaveBeenCalledWith(4, {
                senderId: 7,
                content: "hi",
            });
        });

        it("creates a message as the signed-in user", async () => {
            chatService.createMessage.mockResolvedValue({
                message: { id: 11, content: "hi" },
                recipientId: 9,
            });

            const response = await authed(request(app).post("/4/message")).send({
                content: "hi",
                senderId: 999,
            });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                message: { id: 11, content: "hi" },
                recipientId: 9,
            });
            expect(chatService.createMessage).toHaveBeenCalledWith(4, {
                senderId: 7,
                content: "hi",
            });
        });

        it("forwards whitespace-only content", async () => {
            chatService.createMessage.mockResolvedValue({
                message: { id: 1, content: " " },
                recipientId: 9,
            });

            const response = await authed(request(app).post("/4/message")).send({
                content: " ",
            });

            expect(response.status).toBe(200);
            expect(chatService.createMessage).toHaveBeenCalledWith(4, {
                senderId: 7,
                content: " ",
            });
        });

        it.each([
            ["0", { content: "hi" }],
            ["abc", { content: "hi" }],
            ["4", {}],
            ["4", { content: "" }],
            ["4", { content: 0 }],
        ])("returns 400 for chat %s and body %j", async (id, body) => {
            const response = await authed(request(app).post(`/${id}/message`)).send(body);

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: "Bad request." });
            expect(chatService.createMessage).not.toHaveBeenCalled();
        });

        it("returns 404 when the chat does not exist", async () => {
            chatService.createMessage.mockResolvedValue({ error: "not_found" });

            const response = await authed(request(app).post("/4/message")).send({
                content: "hi",
            });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: "Chat not found." });
        });

        it("returns 403 when the caller is not a participant", async () => {
            chatService.createMessage.mockResolvedValue({ error: "forbidden" });

            const response = await authed(request(app).post("/4/message")).send({
                content: "hi",
            });

            expect(response.status).toBe(403);
            expect(response.body).toEqual({ message: "Access denied." });
        });

        it("returns 500 when the service returns nothing", async () => {
            chatService.createMessage.mockResolvedValue(null);

            const response = await authed(request(app).post("/4/message")).send({
                content: "hi",
            });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Internal server error." });
        });

        it("returns 500 without leaking the internal error", async () => {
            chatService.createMessage.mockRejectedValue(new Error("write leaked"));

            const response = await authed(request(app).post("/4/message")).send({
                content: "hi",
            });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Internal server error." });
            expect(JSON.stringify(response.body)).not.toContain("leaked");
        });
    });

    describe("POST /:id/messages", () => {
        it("returns a slice of messages", async () => {
            const page = [{ id: 1, content: "hi" }];
            chatService.getMessages.mockResolvedValue(page);

            const response = await authed(request(app).post("/4/messages")).send({
                start: 0,
                end: 0,
            });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(page);
            expect(chatService.getMessages).toHaveBeenCalledWith(4, 0, 0, 7);
        });

        it("returns 400 when the range bounds are strings", async () => {
            chatService.getMessages.mockResolvedValue([]);

            const response = await authed(request(app).post("/4/messages")).send({
                start: "0",
                end: "2",
            });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: "Bad request." });
        });

        it.each([
            [{ start: 5, end: 4 }, "the range is reversed"],
            [{ start: -1, end: 2 }, "the start is negative"],
            [{ start: 0, end: 1.5 }, "a bound is fractional"],
            [{ start: "1.2", end: 2 }, "a bound is not an integer string"],
            [{ end: 2 }, "the start is missing"],
            [{ start: 0 }, "the end is missing"],
            [{}, "the body is empty"],
        ])("returns 400 when %j (%s)", async (body) => {
            const response = await authed(request(app).post("/4/messages")).send(body);

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: "Bad request." });
            expect(chatService.getMessages).not.toHaveBeenCalled();
        });

        it("returns 400 for a non-numeric chat id", async () => {
            const response = await authed(request(app).post("/abc/messages")).send({
                start: 0,
                end: 1,
            });

            expect(response.status).toBe(400);
            expect(chatService.getMessages).not.toHaveBeenCalled();
        });

        it("returns a documented status when the caller is not a participant", async () => {
            chatService.getMessages.mockResolvedValue({ error: "forbidden" });

            const response = await authed(request(app).post("/4/messages")).send({
                start: 0,
                end: 10,
            });

            expect(response.status).toBe(403);
            expect(response.body).toEqual({ message: "Access denied." });
        });

        it.each([null, { error: "not_found" }])(
            "returns 404 when the service returns %j",
            async (result) => {
                chatService.getMessages.mockResolvedValue(result);

                const response = await authed(request(app).post("/4/messages")).send({
                    start: 0,
                    end: 10,
                });

                expect(response.status).toBe(404);
                expect(response.body).toEqual({ message: "Chat not found." });
            }
        );

        it("returns 500 without leaking the internal error", async () => {
            chatService.getMessages.mockRejectedValue(new Error("page leaked"));

            const response = await authed(request(app).post("/4/messages")).send({
                start: 0,
                end: 10,
            });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Internal server error." });
            expect(JSON.stringify(response.body)).not.toContain("leaked");
        });
    });

    describe("POST /:id/attachment", () => {
        const file = Buffer.from("hello");

        const upload = (req) => req.attach("file", file, {
            filename: "note.txt",
            contentType: "text/plain",
        });

        it("stores an attachment as the signed-in user", async () => {
            chatService.createAttachment.mockResolvedValue({
                message: { id: 12, kind: "file" },
                recipientId: 9,
            });

            const response = await upload(authed(request(app).post("/4/attachment")));

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                message: { id: 12, kind: "file" },
                recipientId: 9,
            });
            expect(chatService.createAttachment).toHaveBeenCalledWith(4, {
                senderId: 7,
                file: expect.objectContaining({
                    originalname: "note.txt",
                    mimetype: "text/plain",
                }),
            });
        });

        it("returns 400 when the file is missing", async () => {
            const response = await authed(request(app).post("/4/attachment"));

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: "Bad request." });
            expect(chatService.createAttachment).not.toHaveBeenCalled();
        });

        it("returns 400 when the file uses the wrong field name", async () => {
            const response = await authed(request(app).post("/4/attachment"))
                .attach("avatar", file, "note.txt");

            expect(response.status).toBe(400);
            expect(chatService.createAttachment).not.toHaveBeenCalled();
        });

        it("returns 400 for a non-numeric chat id", async () => {
            const response = await upload(authed(request(app).post("/0/attachment")));

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: "Bad request." });
            expect(chatService.createAttachment).not.toHaveBeenCalled();
        });

        it.each([
            ["not_found", 404, "Chat not found."],
            ["forbidden", 403, "Access denied."],
            ["bad_request", 400, "Bad request."],
        ])("maps service error %s to %s", async (error, status, message) => {
            chatService.createAttachment.mockResolvedValue({ error });

            const response = await upload(authed(request(app).post("/4/attachment")));

            expect(response.status).toBe(status);
            expect(response.body).toEqual({ message });
        });

        it("returns 500 without leaking the internal error", async () => {
            chatService.createAttachment.mockRejectedValue(new Error("disk leaked"));

            const response = await upload(authed(request(app).post("/4/attachment")));

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Internal server error." });
            expect(JSON.stringify(response.body)).not.toContain("leaked");
        });
    });

    describe("GET /:id/messages/:messageId/attachment", () => {
        it("returns the attachment bytes and filename", async () => {
            const bytes = Buffer.from("file-bytes");
            chatService.getAttachment.mockResolvedValue({
                buffer: bytes,
                mime: "text/plain",
                name: "raport ą.txt",
            });

            const response = await asBuffer(
                authed(request(app).get("/4/messages/8/attachment"))
            );

            expect(response.status).toBe(200);
            expect(response.headers["content-type"]).toBe("text/plain");
            expect(response.headers["content-disposition"]).toBe(
                `inline; filename*=UTF-8''${encodeURIComponent("raport ą.txt")}`
            );
            expect(Buffer.compare(response.body, bytes)).toBe(0);
            expect(chatService.getAttachment).toHaveBeenCalledWith(4, 8, 7);
        });

        it("accepts a non-buffer payload from the service", async () => {
            chatService.getAttachment.mockResolvedValue({
                buffer: [1, 2, 3],
                mime: "application/octet-stream",
                name: "a.bin",
            });

            const response = await asBuffer(
                authed(request(app).get("/4/messages/8/attachment"))
            );

            expect(response.status).toBe(200);
            expect(Buffer.compare(response.body, Buffer.from([1, 2, 3]))).toBe(0);
        });

        it.each([
            ["/0/messages/8/attachment"],
            ["/4/messages/0/attachment"],
            ["/4/messages/abc/attachment"],
            ["/1.5/messages/8/attachment"],
        ])("returns 400 for %s", async (path) => {
            const response = await authed(request(app).get(path));

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: "Bad request." });
            expect(chatService.getAttachment).not.toHaveBeenCalled();
        });

        it.each([
            ["not_found", 404, "Attachment not found."],
            ["forbidden", 403, "Access denied."],
        ])("maps service error %s to %s", async (error, status, message) => {
            chatService.getAttachment.mockResolvedValue({ error });

            const response = await authed(request(app).get("/4/messages/8/attachment"));

            expect(response.status).toBe(status);
            expect(response.body).toEqual({ message });
        });

        it("returns 500 when the attachment payload cannot be encoded", async () => {
            chatService.getAttachment.mockResolvedValue({
                mime: "text/plain",
                name: "a.txt",
            });

            const response = await authed(request(app).get("/4/messages/8/attachment"));

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Internal server error." });
        });

        it("returns 500 without leaking the internal error", async () => {
            chatService.getAttachment.mockRejectedValue(new Error("blob leaked"));

            const response = await authed(request(app).get("/4/messages/8/attachment"));

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Internal server error." });
            expect(JSON.stringify(response.body)).not.toContain("leaked");
        });
    });
});
