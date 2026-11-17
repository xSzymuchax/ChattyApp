const { User } = require("../../models");
const createUserRepository = require("./user.repository");
const { MARKER, saveAvatar, readAvatar } = require("../../util/avatarStore");
const { readProfile, saveProfile, dropProfile } = require("../../util/profileCache");
const userRepository = createUserRepository(User);

const usesObjectStore = () => Boolean(process.env.S3_ENDPOINT);

const userService = {
    async createUser(data) {
        const user = await userRepository.createUser(data);
        await saveProfile(user);
        return user;
    },

    async getUsers(username = '') {
        return userRepository.getUsers(username);
    },

    async getUserById(id) {
        // KUBERNETES
        const cached = await readProfile(id);

        if (cached)
            return cached;

        const user = await userRepository.getUserById(id);
        await saveProfile(user);
        return user;
    },

    async checkUserExist(email) {
        return userRepository.checkUserExist(email);
    },

    async updateUser(id, data) {
        const user = await userRepository.updateUser(id, data);
        if (user)
            await saveProfile(user);
        else
            await dropProfile(id);
        return user;
    },

    async getUserAvatar(id) {
        const row = await userRepository.getUserAvatar(id);

        if (!usesObjectStore() || row?.error)
            return row;

        // KUBERNETES
        const stored = await readAvatar(id);

        if (stored)
            return { buffer: stored };

        const existing = Buffer.isBuffer(row.buffer) ? row.buffer : Buffer.from(row.buffer);

        if (existing.length > MARKER.length) {
            await saveAvatar(id, existing);
            await userRepository.updateUserAvatar(id, MARKER);
            return { buffer: existing };
        }

        return { error: "no_avatar" };
    },

    async updateUserAvatar(id, avatar) {
        // KUBERNETES
        if (usesObjectStore()) {
            await saveAvatar(id, avatar);
            const user = await userRepository.updateUserAvatar(id, MARKER);
            await saveProfile(user);
            return user;
        }

        // RENDER
        const user = await userRepository.updateUserAvatar(id, avatar);
        await saveProfile(user);
        return user;
    },

    async deleteUser(id) {
        const removed = await userRepository.deleteUser(id);
        if (removed)
            await dropProfile(id);
        return removed;
    },
};

module.exports = userService;