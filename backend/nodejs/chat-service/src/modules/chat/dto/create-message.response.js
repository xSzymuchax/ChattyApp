const z = require("../../../config/zod");
const { MessageInfoResponseDto } = require("./message-info.response");

const CreateMessageResponseDto =
    z.object({
        message: MessageInfoResponseDto,
        recipientId: z.int().openapi({example: 2}),
    })
    .openapi("CreateMessageResponse");

module.exports = { CreateMessageResponseDto };
