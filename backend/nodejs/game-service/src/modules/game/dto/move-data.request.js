const z = require("../../../config/zod");

const MoveDataRequestDto =
    z.object({
        move: z.any().openapi({
            example: { from: { row: 5, col: 0 }, to: { row: 4, col: 1 } },
        }),
    })
    .openapi("MoveDataRequestDto");

module.exports = { MoveDataRequestDto };
