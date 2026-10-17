const z = require("../../../config/zod");

const NotifyRequestDto = z
    .object({
        userId: z.int().openapi({ example: 7 }),
        type: z.string().openapi({
            example: "message",
            description: "Frame type delivered to the user's socket.",
        }),
        message: z.any().openapi({
            description: "Payload placed in the socket frame's message field.",
            example: { id: 1, chatId: 4, senderId: 2, content: "Hello!", attachment: null },
        }),
    })
    .openapi("NotifyRequest");

module.exports = {
    NotifyRequestDto,
};
