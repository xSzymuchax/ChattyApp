const { Op } = require("sequelize");

const hasAvatarAttr = (User) => [
    User.sequelize.literal(`("avatar" IS NOT NULL)`),
    "hasAvatar",
];

const serializeUser = (user, hasAvatarOverride) => {
    if (!user) return null;

    const json = typeof user.toJSON === "function" ? user.toJSON() : { ...user };
    const raw = hasAvatarOverride ?? json.hasAvatar;

    json.hasAvatar =
        raw === true || raw === "true" || raw === "t" || raw === 1;
    delete json.avatar;

    return json;
};

const createUserRepository = (User) => ({
    async getUsers(username = '') {
        const users = await User.findAll({
            where: {
                username: {
                    [Op.like]: `%${username}%`
                }
            },
            attributes: {
                include: [hasAvatarAttr(User)],
            },
            limit: 10
        });

        return users.map((user) => serializeUser(user));
    },

    async createUser(data) {
        const user = await User.create(data);
        return serializeUser(user, false);
    },

    async getUserById(id) {
        const user = await User.findByPk(id, {
            attributes: {
                include: [hasAvatarAttr(User)],
            },
        });

        return serializeUser(user);
    },

    async updateUser(id, data) {

        console.log(id, data);
        
        const user = await User.findByPk(id, {
            attributes: {
                include: [hasAvatarAttr(User)],
            },
        });
        
        if (!user) return null;

        await user.update(data);
        return serializeUser(user);
    },

    async getUserAvatar(id) {
        const user = await User.unscoped().findByPk(id, {
            attributes: ["id", "avatar"],
        });

        if (!user) return { error: "not_found" };

        if (!user.avatar) return { error: "no_avatar" };

        return { buffer: user.avatar };
    },

    async updateUserAvatar(id, avatar) {
        const user = await User.findByPk(id);

        if (!user) return null;

        await user.update({ avatar });
        return serializeUser(user, true);
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