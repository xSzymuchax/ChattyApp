var mockRepository;

jest.mock("bcryptjs", () => ({
    hash: jest.fn(async (password) => `hashed:${password}`),
    compare: jest.fn(),
}));

jest.mock("../../../src/modules/auth/auth.repository", () => {
    mockRepository = {
        createCredential: jest.fn(),
        updatePassword: jest.fn(),
        deleteCredential: jest.fn(),
        checkCredential: jest.fn(),
    };

    return jest.fn(() => mockRepository);
});

const jwt = require("jsonwebtoken");
const authService = require("../../../src/modules/auth/auth.service");

const credentials = (overrides = {}) => ({
    username: "ada",
    email: "ada@example.com",
    password: "ZAQ!2wsx",
    passwordConfirm: "ZAQ!2wsx",
    ...overrides,
});

describe("AuthService", () => {
    beforeAll(() => {
        process.env.JWT_SECRET = "unit-secret";
        process.env.USER_SERVICE_URL = "http://user.test";
    });

    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
    });

    describe("createCredential", () => {
        it("rejects a confirmation that does not match before calling other services", async () => {
            const result = await authService.createCredential(credentials({
                passwordConfirm: "ZAQ!2wsy",
            }));

            expect(result).toEqual({ error: "mismatch" });
            expect(fetch).not.toHaveBeenCalled();
            expect(mockRepository.createCredential).not.toHaveBeenCalled();
        });

        it.each([
            ["is not a string", null],
            ["is shorter than 8 characters", "Ab1!"],
            ["has no lowercase letter", "ALLUPPER1!"],
            ["has no uppercase letter", "alllower1!"],
            ["has no digit", "NoDigits!"],
            ["has no special character", "NoSpecial1"],
        ])("rejects a password that %s", async (_rule, password) => {
            const result = await authService.createCredential(credentials({
                password,
                passwordConfirm: password,
            }));

            expect(result).toEqual({ error: "weak_password" });
            expect(fetch).not.toHaveBeenCalled();
            expect(mockRepository.createCredential).not.toHaveBeenCalled();
        });

        it("rejects an email the user service already has", async () => {
            fetch.mockResolvedValue({ status: 409, ok: false });

            const result = await authService.createCredential(credentials());

            expect(result).toEqual({ error: "exists" });
            expect(mockRepository.createCredential).not.toHaveBeenCalled();
        });

        it("rejects a failed user-service response", async () => {
            fetch.mockResolvedValue({ status: 500, ok: false });

            const result = await authService.createCredential(credentials());

            expect(result).toEqual({ error: "failed" });
        });

        it("rejects a user-service payload without an id", async () => {
            fetch.mockResolvedValue({
                status: 200,
                ok: true,
                json: async () => ({ username: "ada" }),
            });

            const result = await authService.createCredential(credentials());

            expect(result).toEqual({ error: "failed" });
            expect(mockRepository.createCredential).not.toHaveBeenCalled();
        });

        it("stores a hash and the new user id", async () => {
            fetch.mockResolvedValue({
                status: 201,
                ok: true,
                json: async () => ({ id: 7 }),
            });
            mockRepository.createCredential.mockResolvedValue({ id: 3, userId: 7 });

            const data = credentials();
            const result = await authService.createCredential(data);

            expect(fetch).toHaveBeenCalledWith("http://user.test/", expect.objectContaining({
                method: "post",
                body: JSON.stringify({ email: "ada@example.com", username: "ada" }),
            }));
            expect(mockRepository.createCredential).toHaveBeenCalledWith(expect.objectContaining({
                passwordHash: "hashed:ZAQ!2wsx",
                userId: 7,
            }));
            expect(result).toEqual({ id: 3, userId: 7 });
        });
    });

    describe("updateCredential", () => {
        it("rejects a weak replacement password", async () => {
            const result = await authService.updateCredential("ada@example.com", "weak");

            expect(result).toEqual({ error: "weak_password" });
            expect(mockRepository.updatePassword).not.toHaveBeenCalled();
        });

        it("stores a new hash for a strong password", async () => {
            mockRepository.updatePassword.mockResolvedValue(true);

            const result = await authService.updateCredential("ada@example.com", "ZAQ!2wsx");

            expect(mockRepository.updatePassword).toHaveBeenCalledWith(
                "ada@example.com",
                "hashed:ZAQ!2wsx"
            );
            expect(result).toBe(true);
        });
    });

    describe("deleteCredential", () => {
        it("delegates to the repository", async () => {
            mockRepository.deleteCredential.mockResolvedValue(true);

            await expect(authService.deleteCredential("ada@example.com")).resolves.toBe(true);
            expect(mockRepository.deleteCredential).toHaveBeenCalledWith("ada@example.com");
        });
    });

    describe("generateToken", () => {
        it("returns null when the user payload has no id", async () => {
            fetch.mockResolvedValue({
                ok: true,
                json: async () => ({ username: "ada" }),
            });
            mockRepository.checkCredential.mockResolvedValue(true);

            const token = await authService.generateToken("ada@example.com", "ZAQ!2wsx");

            expect(token).toBeNull();
            expect(mockRepository.checkCredential).toHaveBeenCalledWith("ada@example.com", "ZAQ!2wsx");
        });

        it("signs a token for a verified user", async () => {
            fetch.mockResolvedValue({
                ok: true,
                json: async () => ({ id: 7, username: "ada" }),
            });
            mockRepository.checkCredential.mockResolvedValue(true);

            const token = await authService.generateToken("ada@example.com", "ZAQ!2wsx");
            const payload = jwt.verify(token, process.env.JWT_SECRET);

            expect(payload).toEqual(expect.objectContaining({ userId: 7, username: "ada" }));
            expect(fetch).toHaveBeenCalledWith(
                "http://user.test/userOfEmailActive",
                expect.objectContaining({ method: "post" })
            );
        });
    });

    describe("refreshToken", () => {
        it.each([null, undefined, {}, { username: "ada" }, { userId: 0, username: "ada" }])(
            "returns null for %p",
            (user) => {
                expect(authService.refreshToken(user)).toBeNull();
            }
        );

        it("signs a new token from the current session", () => {
            const token = authService.refreshToken({ userId: 7, username: "ada" });
            const payload = jwt.verify(token, process.env.JWT_SECRET);

            expect(payload).toEqual(expect.objectContaining({ userId: 7, username: "ada" }));
        });
    });
});
