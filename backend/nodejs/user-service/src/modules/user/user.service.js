const { User } = require("../../models");
const createUserRepository = require("./user.repository");
const { MARKER, saveAvatar, readAvatar } = require("../../util/avatarStore");
const userRepository = createUserRepository(User);

const usesObjectStore = () => Boolean(process.env.S3_ENDPOINT);

const userService = {
    async createUser(data) {
        return userRepository.createUser(data);
    },

    async getUsers(username = '') {
        return userRepository.getUsers(username);
    },

    async getUserById(id) {
        return userRepository.getUserById(id);
    },

    async checkUserExist(email) {
        return userRepository.checkUserExist(email);
    },

    async updateUser(id, data) {
        return userRepository.updateUser(id, data);
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
            return userRepository.updateUserAvatar(id, MARKER);
        }

        // RENDER
        return userRepository.updateUserAvatar(id, avatar);
    },

    async deleteUser(id) {
        return userRepository.deleteUser(id);
    },
};

module.exports = userService;