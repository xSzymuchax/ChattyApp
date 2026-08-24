const healthSwagger = require("../modules/health/health.swagger");
const chatSwagger = require("../modules/chat/chat.swagger");

const registries = [
  healthSwagger,
  chatSwagger,
];

module.exports = registries;
