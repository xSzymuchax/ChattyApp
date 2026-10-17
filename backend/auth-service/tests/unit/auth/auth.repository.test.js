const bcrypt = require("bcryptjs");
const createAuthRepository = require("../../../src/modules/auth/auth.repository");

const createCredentialModel = () => {
    const rows = [];

    return {
        async create(data) {
            rows.push({ ...data });
            return rows[rows.length - 1];
        },

        async findOne({ where }) {
            const row = rows.find((item) => item.email === where.email);

            if (!row) {
                return null;
            }

            return {
                get passwordHash() {
                    return row.passwordHash;
                },
                async update(patch) {
                    Object.assign(row, patch);
                    return row;
                },
            };
        },
    };
};

describe("auth repository", () => {
    let repository;

    beforeEach(() => {
        repository = createAuthRepository(createCredentialModel());
    });

    it("persists a credential", async () => {
        const created = await repository.createCredential({
            email: "ada@example.com",
            passwordHash: "hash",
            userId: 7,
        });

        expect(created).toEqual(expect.objectContaining({
            email: "ada@example.com",
            userId: 7,
        }));

        expect(creates).not.toEqual(expect.objectContaining({
            passwordHash: "hash",
        }));

        expect(repository.createCredential).toHaveBeenCalledWith({
            email: "ada@example.com",
            passwordHash: "hash",
            userId: 7,
        });
    });

    it("updates the hash of an existing account", async () => {
        await repository.createCredential({
            email: "ada@example.com",
            passwordHash: "old",
            userId: 7,
        });

        await expect(repository.updatePassword("ada@example.com", "new")).resolves.toBe(true);
        await expect(repository.checkCredential("ada@example.com", "secret")).resolves.toBe(false);
    });

    it("returns null when the account to update does not exist", async () => {
        await expect(repository.updatePassword("missing@example.com", "new")).resolves.toBeNull();
    });

    it("deactivates an existing credential and ignores a missing one", async () => {
        await repository.createCredential({
            email: "ada@example.com",
            passwordHash: "hash",
            isActive: true,
        });

        await expect(repository.deleteCredential("ada@example.com")).resolves.toBe(true);
        await expect(repository.deleteCredential("missing@example.com")).resolves.toBe(false);
    });

    it("compares the password against the stored hash", async () => {
        const passwordHash = await bcrypt.hash("ZAQ!2wsx", 4);
        await repository.createCredential({
            email: "ada@example.com",
            passwordHash,
        });

        await expect(repository.checkCredential("ada@example.com", "ZAQ!2wsx")).resolves.toBe(true);
        await expect(repository.checkCredential("ada@example.com", "wrong")).resolves.toBe(false);
        await expect(repository.checkCredential("missing@example.com", "ZAQ!2wsx")).resolves.toBe(false);
    });
});
