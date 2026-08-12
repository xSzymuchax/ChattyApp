const createUserRepository = (User) => ({
    async getAllUsers() {
        return User.findAll();
    }
})

module.exports = createUserRepository;