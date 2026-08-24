const z = require("../../../config/zod");

const ChatDataRequestDto =
    z.object({
        firstUserId: z.int().openapi({example: 1}),
        secondUserId: z.int().openapi({example: 2}),
    })
    .openapi("ChatDataRequestDto");

module.exports = { ChatDataRequestDto };
