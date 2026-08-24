const z = require("../../../config/zod");

const MessageInfoResponseDto =
    z.object({
        id: z.int().openapi({example: 1}),
        chatId: z.int().openapi({example: 1}),
        senderId: z.int().openapi({example: 1}),
        content: z.string().openapi({example: "Hello!"}),
    })
    .openapi("MessageInfoResponse");

module.exports = {
    MessageInfoResponseDto
};
