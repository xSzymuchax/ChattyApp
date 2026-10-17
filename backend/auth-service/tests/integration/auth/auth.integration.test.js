process.env.JWT_SECRET = "integration-secret";
process.env.USER_SERVICE_URL = "http://user.test";

var mockRepository;

jest.mock("../../../src/modules/auth/auth.repository", () => {
    mockRepository = {
        createCredential: jest.fn(),
        updatePassword: jest.fn(),
        deleteCredential: jest.fn(),
        checkCredential: jest.fn(),
    };

    return jest.fn(() => mockRepository);
});

const request = require("supertest");
const jwt = require("jsonwebtoken");
const { UniqueConstraintError } = require("sequelize");

const app = require("../../../src/app");

const registerBody = {
    username: "ada",
    email: "ada@example.com",
    password: "ZAQ!2wsx",
    passwordConfirm: "ZAQ!2wsx",
};

describe("auth integration", () => {
    beforeEach(() => {
        jest.spyOn(console, "log").mockImplementation(() => {});
        jest.clearAllMocks();
        global.fetch = jest.fn();
        mockRepository.createCredential.mockResolvedValue({ id: 1, userId: 7 });
        mockRepository.checkCredential.mockResolvedValue(true);
    });

    afterEach(() => {
        console.log.mockRestore();
    });

    it("stops registration in the service when the password is weak", async () => {
        const response = await request(app).post("/register").send({
            ...registerBody,
            password: "weak",
            passwordConfirm: "weak",
        });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ code: "WEAK_PASSWORD" });
        expect(fetch).not.toHaveBeenCalled();
        expect(mockRepository.createCredential).not.toHaveBeenCalled();
    });

    it("stops registration when the confirmation does not match", async () => {
        const response = await request(app).post("/register").send({
            ...registerBody,
            passwordConfirm: "ZAQ!2wsy",
        });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ code: "PASSWORD_MISMATCH" });
        expect(fetch).not.toHaveBeenCalled();
    });

    it("maps an existing user-service account to 409", async () => {
        fetch.mockResolvedValue({ status: 409, ok: false });

        const response = await request(app).post("/register").send(registerBody);

        expect(response.status).toBe(409);
        expect(response.body).toEqual({ code: "ACCOUNT_EXISTS" });
    });

    it("registers a user and stores the hash returned by the service", async () => {
        fetch.mockResolvedValue({
            status: 201,
            ok: true,
            json: async () => ({ id: 7 }),
        });

        const response = await request(app).post("/register").send(registerBody);

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ message: "User registered." });
        expect(mockRepository.createCredential).toHaveBeenCalledWith(expect.objectContaining({
            email: "ada@example.com",
            userId: 7,
            passwordHash: expect.any(String),
        }));

        const stored = mockRepository.createCredential.mock.calls[0][0];
        expect(stored.passwordHash).not.toBe(registerBody.password);
    });

    it("maps a duplicate credential from the database to 409", async () => {
        fetch.mockResolvedValue({
            status: 201,
            ok: true,
            json: async () => ({ id: 7 }),
        });
        mockRepository.createCredential.mockRejectedValue(new UniqueConstraintError({ message: "dup" }));

        const response = await request(app).post("/register").send(registerBody);

        expect(response.status).toBe(409);
        expect(response.body).toEqual({ code: "ACCOUNT_EXISTS" });
    });

    it("logs in through the user service and the credential check", async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ id: 7, username: "ada" }),
        });

        const response = await request(app).post("/login").send({
            email: "ada@example.com",
            password: "ZAQ!2wsx",
        });

        expect(response.status).toBe(200);
        expect(jwt.verify(response.body.token, process.env.JWT_SECRET)).toEqual(
            expect.objectContaining({ userId: 7, username: "ada" })
        );
        expect(mockRepository.checkCredential).toHaveBeenCalledWith("ada@example.com", "ZAQ!2wsx");
    });

    it("returns 401 when the credential check fails", async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: async () => ({ id: 7, username: "ada" }),
        });
        mockRepository.checkCredential.mockResolvedValue(false);

        const response = await request(app).post("/login").send({
            email: "ada@example.com",
            password: "wrong",
        });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({ code: "INVALID_CREDENTIALS" });
    });

    it("refreshes a verified session token", async () => {
        const current = jwt.sign({ userId: 7, username: "ada" }, process.env.JWT_SECRET);

        const response = await request(app)
            .post("/refresh")
            .set("Authorization", `Bearer ${current}`);

        expect(response.status).toBe(200);
        expect(jwt.verify(response.body.token, process.env.JWT_SECRET)).toEqual(
            expect.objectContaining({ userId: 7, username: "ada" })
        );
    });
});
