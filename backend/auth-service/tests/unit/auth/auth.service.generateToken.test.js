const authService = require("../../../src/modules/auth/auth.service");

var mockCheckCredential;

jest.mock(
    "../../../src/modules/auth/auth.repository",
    () => {
        mockCheckCredential = jest.fn();

        return jest.fn(() => ({
            checkCredential: mockCheckCredential
        }));
    }
);

describe("AuthService", () => {
    beforeAll(() => {
        process.env.JWT_SECRET = "test-secret";
    });

    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("generateToken", () => {
        it("Should return generated authorization token when valid credentials", async () => {
            fetch.mockResolvedValue({
                ok: true,
                json: async () => ({
                    id: 1,
                    username: "User"
                })
            });

            mockCheckCredential.mockResolvedValue(true);

            const email = "test@email.com";
            const password = "ZAQ!2wsx";

            const token = await authService.generateToken(email, password);

            expect(token).toBeDefined();
            expect(typeof token).toBe("string");

            expect(fetch).toHaveBeenCalledWith(
                `${process.env.USER_SERVICE_URL}/user/userOfEmailActive`, {
                method: "post",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                }),
            });

            expect(mockCheckCredential).toHaveBeenCalledWith(
                email,
                password
            );
        });

        it("Should return null if user does not exist", async () => {
            fetch.mockResolvedValue({
                ok: false
            });

            const email = "test@email.com";
            const password = "ZAQ!2wsx";

            const token = await authService.generateToken(email, password);

            expect(token).toBeNull();
            expect(mockCheckCredential).not.toHaveBeenCalled();
        });

        it("Should return null when credentials are invalid", async () => {
            fetch.mockResolvedValue({
                ok: true,
                json: async () => ({
                    id: 1,
                    username: "User"
                })
            });

            mockCheckCredential.mockResolvedValue(false);

            const email = "test@email.com";
            const password = "ZAQ!2wsx";

            const token = await authService.generateToken(email, password);

            expect(token).toBeNull();
            expect(mockCheckCredential).toHaveBeenCalledWith(
                email,
                password
            );
        });
    });
});