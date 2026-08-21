const sequelize = require("../config/database");

const Health = require("../modules/health/models/health.model");
const HealthModel = Health(sequelize);

const Credential = require("../modules/auth/models/credential.model");
const CredentialModel = Credential(sequelize);

module.exports = {
    sequelize,
    Health: HealthModel,
    Credential: CredentialModel
}

// there might be relations later on