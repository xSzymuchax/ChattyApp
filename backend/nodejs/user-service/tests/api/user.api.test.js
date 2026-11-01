process.env.JWT_SECRET = "api-test-secret";

jest.mock("../../src/modules/user/user.service", () => ({
    createUser: jest.fn(),
    getUsers: jest.fn(),
    getUserById: jest.fn(),
    checkUserExist: jest.fn(),
    updateUser: jest.fn(),
    getUserAvatar: jest.fn(),
    updateUserAvatar: jest.fn(),
    deleteUser: jest.fn(),
}));

jest.mock("../../src/util/avatar", () => ({
    processAvatar: jest.fn(),
}));

const request = require("supertest");
const jwt = require("jsonwebtoken");
const { UniqueConstraintError } = require("sequelize");

const app = require("../../src/app");
const userService = require("../../src/modules/user/user.service");
const { processAvatar } = require("../../src/util/avatar");

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
    for (const value of Object.values(userService)) {
        if (jest.isMockFunction(value))
            value.mockReset();
    }
    processAvatar.mockReset();
};

describe("User API", () => {
    beforeEach(() => {
        jest.spyOn(console, "log").mockImplementation(() => {});
        resetMocks();
    });

    afterEach(() => {
        console.log.mockRestore();
    });

    describe("GET /", () => {
        it("returns the list from the service", async () => {
            const users = [{ id: 7, username: "ada" }];
            userService.getUsers.mockResolvedValue(users);

            const response = await request(app).get("/").query({ username: " ada " });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(users);
            expect(userService.getUsers).toHaveBeenCalledWith(" ada ");
        });

        it("calls the service with undefined when the query is missing", async () => {
            userService.getUsers.mockResolvedValue([]);

            const response = await request(app).get("/");

            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
            expect(userService.getUsers).toHaveBeenCalledWith(undefined);
        });

        it("forwards an empty username filter", async () => {
            userService.getUsers.mockResolvedValue([]);

            const response = await request(app).get("/").query({ username: "" });

            expect(response.status).toBe(200);
            expect(userService.getUsers).toHaveBeenCalledWith("");
        });

        it("returns 500 without leaking the internal error", async () => {
            userService.getUsers.mockRejectedValue(new Error("query leaked"));

            const response = await request(app).get("/");

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Internal server error." });
            expect(JSON.stringify(response.body)).not.toContain("leaked");
        });
    });

    describe("GET /:id", () => {
        it("returns the user", async () => {
            const user = { id: 7, username: "ada" };
            userService.getUserById.mockResolvedValue(user);

            const response = await request(app).get("/7");

            expect(response.status).toBe(200);
            expect(response.body).toEqual(user);
            expect(userService.getUserById).toHaveBeenCalledWith("7");
        });

        it("returns 404 when the user does not exist", async () => {
            userService.getUserById.mockResolvedValue(null);

            const response = await request(app).get("/7");

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: "User not found." });
        });

        it.each(["0", "-1", "-4", "abc"])("returns 400 for id %s", async (id) => {
            const response = await request(app).get(`/${id}`);

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: "Bad request." });
            expect(userService.getUserById).not.toHaveBeenCalled();
        });

        it("returns 500 without leaking the internal error", async () => {
            userService.getUserById.mockRejectedValue(new Error("row leaked"));

            const response = await request(app).get("/7");

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Internal server error." });
            expect(JSON.stringify(response.body)).not.toContain("leaked");
        });
    });

    describe("POST /", () => {
        const payload = {
            username: "ada",
            email: "ada@example.com",
            description: "hello",
            password: "ignored",
            confirmPassword: "ignored",
        };

        it("creates a user and drops credential fields", async () => {
            const created = {
                id: 7,
                username: "ada",
                description: "hello",
                email: "ada@example.com",
            };
            userService.createUser.mockResolvedValue(created);

            const response = await request(app).post("/").send(payload);

            expect(response.status).toBe(200);
            expect(response.body).toEqual(created);
            expect(userService.createUser).toHaveBeenCalledWith({
                username: "ada",
                email: "ada@example.com",
                description: "hello",
            });
        });

        it("creates a user when description is omitted", async () => {
            const created = {
                id: 1,
                username: "ada",
                description: null,
                email: "ada@example.com",
            };
            userService.createUser.mockResolvedValue(created);

            const response = await request(app).post("/").send({
                username: "ada",
                email: "ada@example.com",
            });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(created);
            expect(userService.createUser).toHaveBeenCalledWith({
                username: "ada",
                email: "ada@example.com",
                description: undefined,
            });
        });

        it.each([
            [{ email: "ada@example.com" }, "username"],
            [{ username: "ada" }, "email"],
            [{ username: "", email: "ada@example.com" }, "an empty username"],
            [{ username: "ada", email: "" }, "an empty email"],
            [{}, "an empty body"],
        ])("returns 400 when %s is missing (%s)", async (body) => {
            const response = await request(app).post("/").send(body);

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: "Bad request." });
            expect(userService.createUser).not.toHaveBeenCalled();
        });

        it("returns 409 when the service reports a conflict", async () => {
            userService.createUser.mockResolvedValue(null);

            const response = await request(app).post("/").send(payload);

            expect(response.status).toBe(409);
            expect(response.body).toEqual({
                message: "Account with that username/email exists.",
            });
        });

        it("returns 409 when the database rejects a duplicate account", async () => {
            userService.createUser.mockRejectedValue(
                new UniqueConstraintError({ message: "duplicate" })
            );

            const response = await request(app).post("/").send(payload);

            expect(response.status).toBe(409);
            expect(response.body).toEqual({
                message: "Account with that username/email exists.",
            });
        });

        it("rejects a JSON null body before the controller", async () => {
            const response = await request(app)
                .post("/")
                .set("Content-Type", "application/json")
                .send("null");

            expect(response.status).toBe(400);
            expect(userService.createUser).not.toHaveBeenCalled();
        });

        it("returns 500 without leaking the internal error", async () => {
            userService.createUser.mockRejectedValue(new Error("insert leaked"));

            const response = await request(app).post("/").send(payload);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Internal server error." });
            expect(JSON.stringify(response.body)).not.toContain("leaked");
        });
    });

    describe("POST /userOfEmailActive", () => {
        it("returns the user when the email is active", async () => {
            const user = { id: 7, username: "ada", email: "ada@example.com" };
            userService.checkUserExist.mockResolvedValue(user);

            const response = await request(app)
                .post("/userOfEmailActive")
                .send({ email: "ada@example.com" });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(user);
            expect(userService.checkUserExist).toHaveBeenCalledWith("ada@example.com");
        });

        it("returns 404 when the email is unknown", async () => {
            userService.checkUserExist.mockResolvedValue(null);

            const response = await request(app)
                .post("/userOfEmailActive")
                .send({ email: "missing@example.com" });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: "User not found." });
        });

        it("forwards a missing email to the service", async () => {
            userService.checkUserExist.mockResolvedValue(null);

            const response = await request(app).post("/userOfEmailActive").send({});

            expect(response.status).toBe(404);
            expect(userService.checkUserExist).toHaveBeenCalledWith(undefined);
        });

        it("returns 500 without leaking the internal error", async () => {
            userService.checkUserExist.mockRejectedValue(new Error("lookup leaked"));

            const response = await request(app)
                .post("/userOfEmailActive")
                .send({ email: "ada@example.com" });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Internal server error." });
            expect(JSON.stringify(response.body)).not.toContain("leaked");
        });
    });

    describe("PUT /:id", () => {
        it("returns 401 when the authorization header is missing", async () => {
            const response = await request(app).put("/7").send({ description: "x" });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ message: "Invalid or expired token." });
            expect(userService.updateUser).not.toHaveBeenCalled();
        });

        it.each([
            ["Token abc"],
            ["bearer abc"],
            ["Bearer"],
            ["Bearer "],
        ])("returns 401 for authorization %j", async (header) => {
            const response = await request(app)
                .put("/7")
                .set("Authorization", header)
                .send({ description: "x" });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ message: "Invalid or expired token." });
        });

        it("returns 401 for an expired token", async () => {
            const token = jwt.sign({ userId: 7, username: "ada", exp: 1 }, SECRET);

            const response = await request(app)
                .put("/7")
                .set("Authorization", `Bearer ${token}`)
                .send({ description: "x" });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ message: "Invalid or expired token." });
            expect(userService.updateUser).not.toHaveBeenCalled();
        });

        it("updates the signed-in user", async () => {
            const updated = {
                id: 7,
                username: "ada",
                description: "new",
                email: "ada@example.com",
            };
            userService.updateUser.mockResolvedValue(updated);

            const response = await authed(request(app).put("/7")).send({
                username: "ada",
                description: "new",
                email: "ada@example.com",
            });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(updated);
            expect(userService.updateUser).toHaveBeenCalledWith("7", {
                description: "new",
            });
        });

        it("returns 400 when the update body does not match UserDataRequestDto", async () => {
            userService.updateUser.mockResolvedValue({
                id: 7,
                username: "ada",
                description: "new",
                email: "ada@example.com",
            });

            const response = await authed(request(app).put("/7")).send({
                description: null,
            });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: "Bad request." });
            expect(userService.updateUser).not.toHaveBeenCalled();
        });

        it("returns 403 when the path id belongs to somebody else", async () => {
            const response = await authed(request(app).put("/8")).send({
                description: "new",
            });

            expect(response.status).toBe(403);
            expect(response.body).toEqual({ message: "Access denied." });
            expect(userService.updateUser).not.toHaveBeenCalled();
        });

        it("returns 403 for id 0 when the caller is somebody else", async () => {
            const response = await authed(request(app).put("/0")).send({
                description: "new",
            });

            expect(response.status).toBe(403);
            expect(userService.updateUser).not.toHaveBeenCalled();
        });

        it("returns 400 for id 0 when that id matches the token", async () => {
            const response = await authed(
                request(app).put("/0"),
                { userId: 0, username: "zero" }
            ).send({ description: "new" });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: "Bad request." });
            expect(userService.updateUser).not.toHaveBeenCalled();
        });

        it("returns 404 when the user does not exist", async () => {
            userService.updateUser.mockResolvedValue(null);

            const response = await authed(request(app).put("/7")).send({
                description: "new",
            });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: "User not found." });
        });

        it("returns 500 without leaking the internal error", async () => {
            userService.updateUser.mockRejectedValue(new Error("update leaked"));

            const response = await authed(request(app).put("/7")).send({
                description: "new",
            });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Internal server error." });
            expect(JSON.stringify(response.body)).not.toContain("leaked");
        });
    });

    describe("DELETE /:id", () => {
        it("returns 401 when the authorization header is missing", async () => {
            const response = await request(app).delete("/7");

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ message: "Invalid or expired token." });
            expect(userService.deleteUser).not.toHaveBeenCalled();
        });

        it("deletes the signed-in user", async () => {
            userService.deleteUser.mockResolvedValue(true);

            const response = await authed(request(app).delete("/7"));

            expect(response.status).toBe(200);
            expect(response.body).toBe(true);
            expect(userService.deleteUser).toHaveBeenCalledWith("7");
        });

        it("returns 403 when deleting another user", async () => {
            const response = await authed(request(app).delete("/8"));

            expect(response.status).toBe(403);
            expect(response.body).toEqual({ message: "Access denied." });
            expect(userService.deleteUser).not.toHaveBeenCalled();
        });

        it("returns 400 for id 0 when that id matches the token", async () => {
            const response = await authed(
                request(app).delete("/0"),
                { userId: 0, username: "zero" }
            );

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: "Bad request." });
            expect(userService.deleteUser).not.toHaveBeenCalled();
        });

        it("returns 404 when the user does not exist", async () => {
            userService.deleteUser.mockResolvedValue(null);

            const response = await authed(request(app).delete("/7"));

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: "User not found." });
        });

        it("returns 500 without leaking the internal error", async () => {
            userService.deleteUser.mockRejectedValue(new Error("delete leaked"));

            const response = await authed(request(app).delete("/7"));

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Internal server error." });
            expect(JSON.stringify(response.body)).not.toContain("leaked");
        });
    });

    describe("GET /:id/avatar", () => {
        it("returns the avatar bytes", async () => {
            const bytes = Buffer.from([1, 2, 3, 4]);
            userService.getUserAvatar.mockResolvedValue({ buffer: bytes });

            const response = await asBuffer(request(app).get("/7/avatar"));

            expect(response.status).toBe(200);
            expect(response.headers["content-type"]).toBe("image/webp");
            expect(response.headers["cache-control"]).toBe("private, max-age=60");
            expect(Buffer.compare(response.body, bytes)).toBe(0);
        });

        it("accepts a non-buffer payload from the service", async () => {
            userService.getUserAvatar.mockResolvedValue({ buffer: [9, 8, 7] });

            const response = await asBuffer(request(app).get("/7/avatar"));

            expect(response.status).toBe(200);
            expect(Buffer.compare(response.body, Buffer.from([9, 8, 7]))).toBe(0);
        });

        it.each([
            ["not_found", "User not found."],
            ["no_avatar", "Avatar not found."],
        ])("returns 404 when the service reports %s", async (error, message) => {
            userService.getUserAvatar.mockResolvedValue({ error });

            const response = await request(app).get("/7/avatar");

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message });
        });

        it.each(["0", "-2"])("returns 400 for id %s", async (id) => {
            const response = await request(app).get(`/${id}/avatar`);

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: "Bad request." });
            expect(userService.getUserAvatar).not.toHaveBeenCalled();
        });

        it("returns 500 when the avatar payload cannot be encoded", async () => {
            userService.getUserAvatar.mockResolvedValue({});

            const response = await request(app).get("/7/avatar");

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Internal server error." });
        });

        it("returns 500 without leaking the internal error", async () => {
            userService.getUserAvatar.mockRejectedValue(new Error("blob leaked"));

            const response = await request(app).get("/7/avatar");

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Internal server error." });
            expect(JSON.stringify(response.body)).not.toContain("leaked");
        });
    });

    describe("PUT /:id/avatar", () => {
        const png = Buffer.from("not-a-real-png");

        const upload = (req) => req.attach("avatar", png, {
            filename: "face.png",
            contentType: "image/png",
        });

        it("returns 401 when the authorization header is missing", async () => {
            const response = await upload(request(app).put("/7/avatar"));

            expect(response.status).toBe(401);
            expect(response.body).toEqual({ message: "Invalid or expired token." });
            expect(processAvatar).not.toHaveBeenCalled();
            expect(userService.updateUserAvatar).not.toHaveBeenCalled();
        });

        it("stores a processed avatar for the signed-in user", async () => {
            const stored = { id: 7, hasAvatar: true };
            const processed = Buffer.from("webp-bytes");
            processAvatar.mockResolvedValue(processed);
            userService.updateUserAvatar.mockResolvedValue(stored);

            const response = await upload(authed(request(app).put("/7/avatar")));

            expect(response.status).toBe(200);
            expect(response.body).toEqual(stored);
            expect(processAvatar).toHaveBeenCalledWith(expect.any(Buffer));
            expect(userService.updateUserAvatar).toHaveBeenCalledWith("7", processed);
        });

        it("returns 403 when updating another user's avatar", async () => {
            const response = await upload(authed(request(app).put("/8/avatar")));

            expect(response.status).toBe(403);
            expect(response.body).toEqual({ message: "Access denied." });
            expect(processAvatar).not.toHaveBeenCalled();
            expect(userService.updateUserAvatar).not.toHaveBeenCalled();
        });

        it("returns 400 when the file field is missing", async () => {
            const response = await authed(request(app).put("/7/avatar"));

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: "Bad request." });
            expect(processAvatar).not.toHaveBeenCalled();
        });

        it("returns 400 when the file uses the wrong field name", async () => {
            const response = await authed(request(app).put("/7/avatar"))
                .attach("file", png, {
                    filename: "face.png",
                    contentType: "image/png",
                });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: "Bad request." });
            expect(userService.updateUserAvatar).not.toHaveBeenCalled();
        });

        it("returns 400 for an unsupported media type", async () => {
            const response = await authed(request(app).put("/7/avatar"))
                .attach("avatar", Buffer.from("<svg></svg>"), {
                    filename: "face.svg",
                    contentType: "image/svg+xml",
                });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: "Bad request." });
            expect(processAvatar).not.toHaveBeenCalled();
        });

        it("returns 400 for an avatar larger than 2 MB", async () => {
            const response = await authed(request(app).put("/7/avatar"))
                .attach("avatar", Buffer.alloc(2 * 1024 * 1024 + 1), {
                    filename: "big.png",
                    contentType: "image/png",
                });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: "Bad request." });
            expect(processAvatar).not.toHaveBeenCalled();
            expect(userService.updateUserAvatar).not.toHaveBeenCalled();
        }, 20000);

        it("returns 404 when the user does not exist", async () => {
            processAvatar.mockResolvedValue(Buffer.from("webp"));
            userService.updateUserAvatar.mockResolvedValue(null);

            const response = await upload(authed(request(app).put("/7/avatar")));

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: "User not found." });
        });

        it("returns 500 when image processing fails", async () => {
            processAvatar.mockRejectedValue(new Error("sharp leaked"));

            const response = await upload(authed(request(app).put("/7/avatar")));

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Internal server error." });
            expect(userService.updateUserAvatar).not.toHaveBeenCalled();
            expect(JSON.stringify(response.body)).not.toContain("leaked");
        });

        it("returns 500 without leaking a service error", async () => {
            processAvatar.mockResolvedValue(Buffer.from("webp"));
            userService.updateUserAvatar.mockRejectedValue(new Error("write leaked"));

            const response = await upload(authed(request(app).put("/7/avatar")));

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Internal server error." });
            expect(JSON.stringify(response.body)).not.toContain("leaked");
        });
    });
});
