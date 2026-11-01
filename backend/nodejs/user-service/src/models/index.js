const sequelize = require("../config/database");

const User = require("../modules/user/models/user.model");
const UserModel = User(sequelize);

module.exports = {
    sequelize,
    User: UserModel
}

// there might be relations later on