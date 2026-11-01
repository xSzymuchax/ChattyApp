const healthSwagger = require("../modules/health/health.swagger");
const authSwagger = require("../modules/auth/auth.swagger");

const registries = [
  healthSwagger,
  authSwagger,
];

module.exports = registries;