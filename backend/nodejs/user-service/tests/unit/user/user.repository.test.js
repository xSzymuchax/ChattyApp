const { Op } = require("sequelize");
const createUserRepository = require("../../../src/modules/user/user.repository");

const createUserModel = () => {
    const rows = [];

    const wrap = (row) => ({
        ...row,
        toJSON() {
            return { ...row };
        },
        async update(patch) {
            Object.assign(row, patch);
            Object.assign(this, patch);
            return row;
        },
    });

    const User = {
        sequelize: {
            literal: (sql) => sql,
        },
        async create(data) {
            const row = { id: rows.length + 1, isActive: true, avatar: null, hasAvatar: false, ...data };
            rows.push(row);
            return wrap(row);
        },
        async findAll({ where, limit }) {
            const pattern = String(where.username[Op.like]).slice(1, -1);
            return rows
                .filter((row) => row.username.includes(pattern))
                .slice(0, limit)
                .map(wrap);
        },
        async findByPk(id) {
            const row = rows.find((item) => item.id === Number(id));
            return row ? wrap(row) : null;
        },
        unscoped() {
            return this;
        },
        async findOne({ where }) {
            const row = rows.find((item) => item.email === where.email && item.isActive === where.isActive);
            return row ? wrap(row) : null;
        },
    };

    return { User, rows };
};

describe("user repository", () => {
    let repository;
    let rows;

    beforeEach(() => {
        const model = createUserModel();
        rows = model.rows;
        repository = createUserRepository(model.User);
    });

    it("creates a user without exposing the avatar bytes", async () => {
        const user = await repository.createUser({
            username: "ada",
            email: "ada@example.com",
            description: "hi",
            avatar: Buffer.from("secret"),
        });

        expect(user).toEqual(expect.objectContaining({
            id: 1,
            username: "ada",
            hasAvatar: false,
        }));
        expect(user.avatar).toBeUndefined();
    });

    it("limits the search to ten matching usernames", async () => {
        for (let index = 0; index < 12; index += 1) {
            await repository.createUser({
                username: `ada-${index}`,
                email: `ada-${index}@example.com`,
            });
        }
        await repository.createUser({ username: "grace", email: "grace@example.com" });

        const users = await repository.getUsers("ada");

        expect(users).toHaveLength(10);
        expect(users.every((user) => user.username.startsWith("ada"))).toBe(true);
    });

    it("reads hasAvatar from the query attribute and drops the avatar column", async () => {
        await repository.createUser({ username: "ada", email: "ada@example.com" });
        rows[0].avatar = Buffer.from("png");
        rows[0].hasAvatar = "t";

        const user = await repository.getUserById(1);

        expect(user.hasAvatar).toBe(true);
        expect(user.avatar).toBeUndefined();
    });

    it("returns null for a missing user and updates an existing description", async () => {
        await expect(repository.updateUser(4, { description: "nope" })).resolves.toBeNull();

        await repository.createUser({ username: "ada", email: "ada@example.com", description: "old" });
        const updated = await repository.updateUser(1, { description: "new" });

        expect(updated.description).toBe("new");
    });

    it("returns avatar bytes only when a user has one", async () => {
        await repository.createUser({ username: "ada", email: "ada@example.com" });

        await expect(repository.getUserAvatar(9)).resolves.toEqual({ error: "not_found" });
        await expect(repository.getUserAvatar(1)).resolves.toEqual({ error: "no_avatar" });

        const avatar = Buffer.from("webp");
        await repository.updateUserAvatar(1, avatar);

        await expect(repository.getUserAvatar(1)).resolves.toEqual({ buffer: avatar });
    });

    it("returns null when updating the avatar of a missing user", async () => {
        await expect(repository.updateUserAvatar(3, Buffer.from("x"))).resolves.toBeNull();
    });

    it("deactivates an active user once", async () => {
        await repository.createUser({ username: "ada", email: "ada@example.com" });

        await expect(repository.deleteUser(1)).resolves.toBe(true);
        await expect(repository.deleteUser(1)).resolves.toBe(false);
        await expect(repository.deleteUser(9)).resolves.toBe(false);
        expect(rows[0].isActive).toBe(false);
    });

    it("returns the active user model for an email lookup", async () => {
        await repository.createUser({ username: "ada", email: "ada@example.com" });

        const found = await repository.checkUserExist("ada@example.com");
        expect(found.email).toBe("ada@example.com");

        await repository.deleteUser(1);
        await expect(repository.checkUserExist("ada@example.com")).resolves.toBe(false);
    });
});
