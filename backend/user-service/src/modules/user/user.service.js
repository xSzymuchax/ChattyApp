const { User } = require("../../models");
const createUserRepository = require("./user.repository");
const userRepository = createUserRepository(User);

const userService = {
    async getUsers() {
        return userRepository.getUsers();
    }
}

module.exports = userService;