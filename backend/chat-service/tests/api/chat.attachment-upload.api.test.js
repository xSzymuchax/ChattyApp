process.env.JWT_SECRET = "api-test-secret";

const mockMulterError = { current: null };

jest.mock("multer", () => {
    const multer = () => ({
        single: () => (req, res, callback) => {
            callback(mockMulterError.current);
        },
    });
    multer.memoryStorage = () => ({});
    return multer;
});

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

const token = jwt.sign(
    { userId: 7, username: "ada" },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
);

describe("POST /:id/attachment upload errors", () => {
    beforeEach(() => {
        jest.spyOn(console, "log").mockImplementation(() => {});
        mockMulterError.current = null;
        chatService.createAttachment.mockReset();
    });

    afterEach(() => {
        console.log.mockRestore();
    });

    it("returns 400 when the file exceeds the size limit", async () => {
        const error = new Error("File too large");
        error.code = "LIMIT_FILE_SIZE";
        mockMulterError.current = error;

        const response = await request(app)
            .post("/4/attachment")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "File is too large." });
        expect(chatService.createAttachment).not.toHaveBeenCalled();
    });

    it("returns 400 when the upload parser fails", async () => {
        mockMulterError.current = new Error("broken multipart");

        const response = await request(app)
            .post("/4/attachment")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Bad request." });
        expect(chatService.createAttachment).not.toHaveBeenCalled();
    });
});
