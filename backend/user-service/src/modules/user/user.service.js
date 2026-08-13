const { User } = require("../../models");
const createUserRepository = require("./user.repository");
const userRepository = createUserRepository(User);

const userService = {
    async createUser(data) {
        return userRepository.createUser(data);
    },

    async getUsers() {
        return userRepository.getUsers();
    },

    async getUserById(id) {
        return userRepository.getUser(id);
    },

    async updateUser(id, data) {
        return userRepository.updateUser(id, data);
    },

    async deleteUser(id) {
        return userRepository.deleteUser(id);
    },
};

module.exports = userService;