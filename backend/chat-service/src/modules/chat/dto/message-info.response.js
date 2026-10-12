const z = require("../../../config/zod");

const AttachmentInfoDto =
    z.object({
        name: z.string().openapi({example: "photo.webp"}),
        mime: z.string().openapi({example: "image/webp"}),
        size: z.int().openapi({example: 48211}),
        kind: z.enum(["image", "file"]).openapi({example: "image"}),
    })
    .openapi("AttachmentInfo");

const MessageInfoResponseDto =
    z.object({
        id: z.int().openapi({example: 1}),
        chatId: z.int().openapi({example: 1}),
        senderId: z.int().openapi({example: 1}),
        content: z.string().openapi({example: "Hello!"}),
        attachment: AttachmentInfoDto.nullable().openapi({example: null}),
    })
    .openapi("MessageInfoResponse");

module.exports = {
    MessageInfoResponseDto
};
