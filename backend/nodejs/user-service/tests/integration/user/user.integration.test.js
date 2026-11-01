process.env.JWT_SECRET = "integration-secret";

var mockRepository;

jest.mock("../../../src/modules/user/user.repository", () => {
    const users = [];
    let nextId = 1;

    mockRepository = {
        users,
        async createUser(data) {
            if (users.some((user) => user.email === data.email || user.username === data.username)) {
                return null;
            }

            const user = {
                id: nextId,
                isActive: true,
                hasAvatar: false,
                description: data.description ?? null,
                username: data.username,
                email: data.email,
            };
            nextId += 1;
            users.push(user);
            return { ...user };
        },
        async getUsers(username = "") {
            return users.filter((user) => user.username.includes(username)).slice(0, 10);
        },
        async getUserById(id) {
            const user = users.find((item) => item.id === Number(id));
            return user ? { ...user } : null;
        },
        async updateUser(id, data) {
            const user = users.find((item) => item.id === Number(id));
            if (!user) return null;
            Object.assign(user, data);
            return { ...user };
        },
        async deleteUser(id) {
            const user = users.find((item) => item.id === Number(id) && item.isActive);
            if (!user) return false;
            user.isActive = false;
            return true;
        },
        async checkUserExist(email) {
            return users.find((user) => user.email === email && user.isActive) ?? false;
        },
        async getUserAvatar() {
            return { error: "no_avatar" };
        },
        async updateUserAvatar() {
            return null;
        },
        reset() {
            users.length = 0;
            nextId = 1;
        },
    };

    return jest.fn(() => mockRepository);
});

const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../../../src/app");

const tokenFor = (userId) =>
    jwt.sign({ userId, username: "ada" }, process.env.JWT_SECRET);

describe("user integration", () => {
    beforeEach(() => {
        jest.spyOn(console, "log").mockImplementation(() => {});
        mockRepository.reset();
    });

    afterEach(() => {
        console.log.mockRestore();
    });

    it("creates a user and reads that user back", async () => {
        const created = await request(app).post("/").send({
            username: "ada",
            email: "ada@example.com",
            description: "hi",
        });

        expect(created.status).toBe(200);
        expect(created.body).toEqual(expect.objectContaining({
            id: 1,
            username: "ada",
            email: "ada@example.com",
        }));

        const fetched = await request(app).get("/1");
        expect(fetched.status).toBe(200);
        expect(fetched.body.username).toBe("ada");

        const listed = await request(app).get("/").query({ username: "ad" });
        expect(listed.status).toBe(200);
        expect(listed.body).toHaveLength(1);
    });

    it("rejects a create request that has no username", async () => {
        const response = await request(app).post("/").send({ email: "ada@example.com" });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Bad request." });
        expect(mockRepository.users).toHaveLength(0);
    });

    it("rejects a duplicate username", async () => {
        await request(app).post("/").send({
            username: "ada",
            email: "ada@example.com",
        });

        const response = await request(app).post("/").send({
            username: "ada",
            email: "other@example.com",
        });

        expect(response.status).toBe(409);
        expect(response.body).toEqual({ message: "Account with that username/email exists." });
    });

    it("returns 404 for an unknown user and an unknown active email", async () => {
        const byId = await request(app).get("/4");
        const byEmail = await request(app).post("/userOfEmailActive").send({
            email: "missing@example.com",
        });

        expect(byId.status).toBe(404);
        expect(byEmail.status).toBe(404);
    });

    it("lets the owner update and delete the account", async () => {
        await request(app).post("/").send({
            username: "ada",
            email: "ada@example.com",
            description: "old",
        });

        const updated = await request(app)
            .put("/1")
            .set("Authorization", `Bearer ${tokenFor(1)}`)
            .send({ description: "new" });

        expect(updated.status).toBe(200);
        expect(updated.body.description).toBe("new");

        const removed = await request(app)
            .delete("/1")
            .set("Authorization", `Bearer ${tokenFor(1)}`);

        expect(removed.status).toBe(200);
        expect(removed.body).toBe(true);

        const lookup = await request(app).post("/userOfEmailActive").send({
            email: "ada@example.com",
        });
        expect(lookup.status).toBe(404);
    });

    it("denies an update from a different user", async () => {
        await request(app).post("/").send({
            username: "ada",
            email: "ada@example.com",
        });

        const response = await request(app)
            .put("/1")
            .set("Authorization", `Bearer ${tokenFor(2)}`)
            .send({ description: "hijack" });

        expect(response.status).toBe(403);
        expect(response.body).toEqual({ message: "Access denied." });
        expect(mockRepository.users[0].description).toBeNull();
    });
});
