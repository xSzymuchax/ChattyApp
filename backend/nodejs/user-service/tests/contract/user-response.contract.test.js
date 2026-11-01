const createUserRepository = require("../../src/modules/user/user.repository");
const { UserInfoResponseDto } = require("../../src/modules/user/dto/user-info.response");

const storedUser = {
    id: 1,
    username: "Janex",
    description: "Lecimy do przodu!",
    email: "Janex@example.org",
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    hasAvatar: false,
};

const User = {
    sequelize: {
        literal: (value) => value,
    },
    findByPk: async () => ({
        toJSON: () => ({ ...storedUser }),
        update: async () => {},
        isActive: true,
    }),
    findOne: async () => ({
        toJSON: () => ({ ...storedUser }),
    }),
    findAll: async () => [{
        toJSON: () => ({ ...storedUser }),
    }],
    create: async () => ({
        toJSON: () => ({ ...storedUser, hasAvatar: false }),
    }),
};

describe("UserInfoResponseDto", () => {
    const repository = createUserRepository(User);

    it("matches a user loaded by id exactly", async () => {
        const user = await repository.getUserById(1);

        expect(UserInfoResponseDto.strict().safeParse(user).success).toBe(true);
    });

    it("matches a user list exactly", async () => {
        const users = await repository.getUsers("Jan");

        expect(users).toHaveLength(1);
        expect(UserInfoResponseDto.strict().safeParse(users[0]).success).toBe(true);
    });

    it("matches an active user looked up by email exactly", async () => {
        const user = await repository.checkUserExist("Janex@example.org");
        const body = typeof user.toJSON === "function" ? user.toJSON() : user;

        expect(UserInfoResponseDto.strict().safeParse(body).success).toBe(true);
    });
});
