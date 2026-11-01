const z = require("../../../config/zod");
const { ALLOWED_GAME_NAMES } = require("../game.constants");

const MoveInfoDto =
    z.object({
        userId: z.int().openapi({ example: 1 }),
        move: z.any().openapi({
            example: { from: { row: 5, col: 0 }, to: { row: 4, col: 1 } },
        }),
    })
    .openapi("MoveInfo");

const GameInfoResponseDto =
    z.object({
        id: z.string().openapi({ example: "3f1a2c8e-4b9d-4e2a-9c1b-8a7f6e5d4c3b" }),
        gameName: z.enum(ALLOWED_GAME_NAMES).openapi({ example: ALLOWED_GAME_NAMES[0] }),
        firstUserId: z.int().openapi({ example: 1 }),
        secondUserId: z.int().openapi({ example: 2 }),
        status: z.enum(["pending", "active"]).openapi({ example: "pending" }),
        gameState: z.any(),
        moves: z.array(MoveInfoDto),
    })
    .openapi("GameInfoResponse");

const GameListResponseDto =
    z.array(GameInfoResponseDto).openapi("GameListResponse");

module.exports = {
    GameInfoResponseDto,
    GameListResponseDto,
};
