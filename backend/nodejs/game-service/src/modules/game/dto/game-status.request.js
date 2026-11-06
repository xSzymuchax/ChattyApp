const z = require("../../../config/zod");

const GameStatusRequestDto =
    z.object({
        status: z.literal("active").openapi({ example: "active" }),
    })
    .openapi("GameStatusRequest");

module.exports = { GameStatusRequestDto };
