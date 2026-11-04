const z = require("../../../config/zod");

const ChatInfoResponseDto =
    z.object({
        id: z.int().openapi({example: 1}),
        name: z.string().nullable().openapi({example: null}),
        createdBy: z.int().openapi({example: 1}),
        memberIds: z.array(z.int()).openapi({example: [1, 2]}),
        adminIds: z.array(z.int()).openapi({example: [1]}),
    })
    .openapi("ChatInfoResponse");

module.exports = {
    ChatInfoResponseDto
};
