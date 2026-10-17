const z = require("../../../config/zod");

const MessageDataRequestDto =
    z.object({
        content: z.string().openapi({example: "Hello!"}),
    })
    .openapi("MessageDataRequestDto");

module.exports = { MessageDataRequestDto };
