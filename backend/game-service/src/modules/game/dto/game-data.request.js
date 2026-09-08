const z = require("../../../config/zod");
const { ALLOWED_GAME_NAMES } = require("../game.constants");

const GameDataRequestDto =
    z.object({
        gameName: z.enum(ALLOWED_GAME_NAMES).openapi({ example: ALLOWED_GAME_NAMES[0] }),
        firstUserId: z.int().openapi({ example: 1 }),
        secondUserId: z.int().openapi({ example: 2 }),
    })
    .openapi("GameDataRequestDto");

module.exports = { GameDataRequestDto };
