const sequelize = require("../config/database");

const Health = require("../modules/health/models/health.model");
const HealthModel = Health(sequelize);

module.exports = {
    sequelize,
    Health: HealthModel
}

// there might be relations later on