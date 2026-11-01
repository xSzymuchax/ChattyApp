const checkers = require("./checkers");
const abalone = require("./abalone");

const RULES_BY_NAME = {
    Checkers: checkers,
    Abalone: abalone,
};

const ALLOWED_GAME_NAMES = Object.keys(RULES_BY_NAME);

const getRules = (gameName) => RULES_BY_NAME[gameName] ?? null;

module.exports = {
    ALLOWED_GAME_NAMES,
    getRules,
};
