const z = require("../../../config/zod");

const ChatInfoResponseDto =
    z.object({
        id: z.int().openapi({example: 1}),
        firstUserId: z.int().openapi({example: 1}),
        secondUserId: z.int().openapi({example: 2}),
    })
    .openapi("ChatInfoResponse");

module.exports = {
    ChatInfoResponseDto
};
