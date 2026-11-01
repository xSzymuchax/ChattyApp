const healthSwagger = require("../modules/health/health.swagger");
const userSwagger = require("../modules/user/user.swagger");

const registries = [
  healthSwagger,
  userSwagger,
];

module.exports = registries;