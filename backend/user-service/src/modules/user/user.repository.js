const createUserRepository = (User) => ({
    async getUsers() {
        return User.findAll();
    },

    async createUser(data) {
        return User.create(data);
    },

    async getUserById(id) {
        return User.findByPk(id);
    },

    async updateUser(id, data) {

        console.log(id, data);
        
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
    },

    async checkUserExist(email){
        const user = await User.findOne({
            where: {
                email: email,
                isActive: true
            }
        });

        if (!user) return false;

        return user;
    }
})

module.exports = createUserRepository;