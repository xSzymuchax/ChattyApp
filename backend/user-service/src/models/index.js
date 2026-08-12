const sequelize = require("../config/database");

const Health = require("../modules/health/models/health.model");
const HealthModel = Health(sequelize);

const User = require("../modules/user/models/user.model");
const UserModel = User(sequelize);

module.exports = {
    sequelize,
    Health: HealthModel,
    User: UserModel
}

// there might be relations later on