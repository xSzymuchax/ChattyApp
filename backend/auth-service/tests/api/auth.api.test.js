process.env.JWT_SECRET = "api-test-secret";

jest.mock("../../src/modules/auth/auth.service", () => ({
    createCredential: jest.fn(),
    generateToken: jest.fn(),
    refreshToken: jest.fn(),
}));

const request = require("supertest");
const jwt = require("jsonwebtoken");
const { UniqueConstraintError } = require("sequelize");

const app = require("../../src/app");
const authService = require("../../src/modules/auth/auth.service");

const SECRET = process.env.JWT_SECRET;

const sign = (payload = { userId: 7, username: "ada" }) =>
    jwt.sign(payload, SECRET, { expiresIn: "1h" });

describe("Auth API", () => {
    beforeEach(() => {
        jest.spyOn(console, "log").mockImplementation(() => {});
        authService.createCredential.mockReset();
        authService.generateToken.mockReset();
        authService.refreshToken.mockReset();
    });

    afterEach(() => {
        console.log.mockRestore();
    });

    describe("POST /register", () => {
        it("returns 201 when credentials are created", async () => {
            authService.createCredential.mockResolvedValue({ userId: 7 });

            const body = {
                username: "ada",
                email: "ada@example.com",
                password: "ZAQ!2wsx",
                passwordConfirm: "ZAQ!2wsx",
            };

            const response = await request(app).post("/register").send(body);

            expect(response.status).toBe(201);
            expect(response.body).toEqual({ message: "User registered." });
            expect(authService.createCredential).toHaveBeenCalledWith(body);
        });

        it("returns 400 when the body does not match RegisterRequestDto", async () => {
            authService.createCredential.mockResolvedValue({ userId: 1 });

            const response = await request(app).post("/register").send({});

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: "Bad request." });
        });

        it.each([
            ["weak_password", 400, "Bad request."],
            ["mismatch", 400, "Bad request."],
            ["exists", 409, "Account exists."],
            ["failed", 400, "Bad request."],
        ])("maps service error %s to %s %s", async (error, status, message) => {
            authService.createCredential.mockResolvedValue({ error });

            const response = await request(app).post("/register").send({
                username: "ada",
                email: "ada@example.com",
                password: "weak",
                passwordConfirm: "other",
            });

            expect(response.status).toBe(status);
            expect(response.body).toEqual({ message });
        });

        it("returns 409 when the database rejects a duplicate account", async () => {
            authService.createCredential.mockRejectedValue(
                new UniqueConstraintError({ message: "duplicate" })
            );

            const response = await request(app).post("/register").send({
                username: "ada",
                email: "ada@example.com",
                password: "ZAQ!2wsx",
                passwordConfirm: "ZAQ!2wsx",
            });

            expect(response.status).toBe(409);
            expect(response.body).toEqual({ message: "Account exists." });
        });

        it("returns 500 without leaking the internal error", async () => {
            authService.createCredential.mockRejectedValue(new Error("db password leaked"));

            const response = await request(app).post("/register").send({
                username: "ada",
            });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Internal server error." });
            expect(JSON.stringify(response.body)).not.toContain("leaked");
        });
    });

    describe("POST /login", () => {
        it("returns the token from the service", async () => {
            authService.generateToken.mockResolvedValue("signed-token");

            const response = await request(app).post("/login").send({
                email: "ada@example.com",
                password: "ZAQ!2wsx",
            });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ token: "signed-token" });
            expect(authService.generateToken).toHaveBeenCalledWith(
                "ada@example.com",
                "ZAQ!2wsx"
            );
        });

        it("returns 400 when email or password is missing", async () => {
            authService.generateToken.mockResolvedValue("signed-token");

            const response = await request(app).post("/login").send({});

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: "Bad request." });
        });

        it.each([null, ""])("returns 401 when the service returns %p", async (token) => {
            authService.generateToken.mockResolvedValue(token);

            const response = await request(app).post("/login").send({
                email: "ada@example.com",
                password: "wrong",
            });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ message: "Invalid credentials." });
        });

        it("returns 500 without leaking the internal error", async () => {
            authService.generateToken.mockRejectedValue(new Error("smtp secret leaked"));

            const response = await request(app).post("/login").send({
                email: "ada@example.com",
                password: "ZAQ!2wsx",
            });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Internal server error." });
            expect(JSON.stringify(response.body)).not.toContain("leaked");
        });

        it("rejects a JSON null body before the controller", async () => {
            const response = await request(app)
                .post("/login")
                .set("Content-Type", "application/json")
                .send("null");

            expect(response.status).toBe(400);
            expect(authService.generateToken).not.toHaveBeenCalled();
        });
    });

    describe("POST /refresh", () => {
        const protectedRequest = () => request(app).post("/refresh");

        it("returns 401 when the authorization header is missing", async () => {
            const response = await protectedRequest();

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ message: "Invalid or expired token." });
            expect(authService.refreshToken).not.toHaveBeenCalled();
        });

        it.each([
            ["Token abc", "a non-bearer scheme"],
            ["bearer abc", "a lowercase scheme"],
            ["Bearer", "a missing token"],
            ["Bearer ", "an empty token"],
            ["Bearer  abc", "a token after an extra space"],
        ])("returns 401 for %s (%s)", async (header) => {
            const response = await protectedRequest().set("Authorization", header);

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ message: "Invalid or expired token." });
            expect(authService.refreshToken).not.toHaveBeenCalled();
        });

        it("returns 401 for a malformed token", async () => {
            const response = await protectedRequest().set("Authorization", "Bearer not-a-jwt");

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ message: "Invalid or expired token." });
        });

        it("returns 401 for a token signed with another secret", async () => {
            const token = jwt.sign({ userId: 7, username: "ada" }, "other-secret");
            const response = await protectedRequest().set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ message: "Invalid or expired token." });
        });

        it("returns 401 for an expired token", async () => {
            const token = jwt.sign({ userId: 7, username: "ada", exp: 1 }, SECRET);
            const response = await protectedRequest().set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ message: "Invalid or expired token." });
            expect(authService.refreshToken).not.toHaveBeenCalled();
        });

        it("returns a new token for a valid session", async () => {
            authService.refreshToken.mockReturnValue("refreshed-token");

            const response = await protectedRequest().set(
                "Authorization",
                `Bearer ${sign()}`
            );

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ token: "refreshed-token" });
            expect(authService.refreshToken).toHaveBeenCalledWith(
                expect.objectContaining({ userId: 7, username: "ada" })
            );
        });

        it("still calls the service when the token has no user id", async () => {
            authService.refreshToken.mockReturnValue("refreshed-token");

            const response = await protectedRequest().set(
                "Authorization",
                `Bearer ${sign({ username: "ada" })}`
            );

            expect(response.status).toBe(200);
            expect(authService.refreshToken).toHaveBeenCalledWith(
                expect.objectContaining({ username: "ada" })
            );
        });

        it.each([null, ""])("returns 401 when the service returns %p", async (token) => {
            authService.refreshToken.mockReturnValue(token);

            const response = await protectedRequest().set(
                "Authorization",
                `Bearer ${sign()}`
            );

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ message: "Invalid or expired token." });
        });

        it("returns 500 without leaking the internal error", async () => {
            authService.refreshToken.mockImplementation(() => {
                throw new Error("signing key leaked");
            });

            const response = await protectedRequest().set(
                "Authorization",
                `Bearer ${sign()}`
            );

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Internal server error." });
            expect(JSON.stringify(response.body)).not.toContain("leaked");
        });
    });
});
