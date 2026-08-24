const z = require("../../../config/zod");

const MessageDataRequestDto =
    z.object({
        senderId: z.int().openapi({example: 1}),
        content: z.string().openapi({example: "Hello!"}),
    })
    .openapi("MessageDataRequestDto");

module.exports = { MessageDataRequestDto };
