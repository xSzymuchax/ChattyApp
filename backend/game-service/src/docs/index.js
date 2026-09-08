const healthSwagger = require("../modules/health/health.swagger");
const gameSwagger = require("../modules/game/game.swagger");

const registries = [
  healthSwagger,
  gameSwagger,
];

module.exports = registries;
