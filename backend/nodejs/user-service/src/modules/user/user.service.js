const { User } = require("../../models");
const createUserRepository = require("./user.repository");
const userRepository = createUserRepository(User);

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
        return userRepository.getUserAvatar(id);
    },

    async updateUserAvatar(id, avatar) {
        return userRepository.updateUserAvatar(id, avatar);
    },

    async deleteUser(id) {
        return userRepository.deleteUser(id);
    },
};

module.exports = userService;