const sequelize = require("../config/database");

const Credential = require("../modules/auth/models/credential.model");
const CredentialModel = Credential(sequelize);

module.exports = {
    sequelize,
    Credential: CredentialModel
}

// there might be relations later on