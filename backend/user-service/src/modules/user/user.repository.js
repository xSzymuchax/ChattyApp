const createUserRepository = (User) => ({
    async getUsers() {
        return User.findAll();
    },

    async createUser(data) {
        return User.create(data);
    },

    async getUser(id) {
        return User.findByPk(id);
    },

    async updateUser(id, data) {
        const user = await User.findByPk(id);
        
        if (!user) return null;

        await user.update(data);
        return user;
    },

    async deleteUser(id) {
        const user = await User.findByPk(id);

        if (!user || !user.isActive ) return false;

        await user.update({isActive: false});
        return true;
    }
})

module.exports = createUserRepository;