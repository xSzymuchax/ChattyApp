const z = require("../../../config/zod");

const IdParamsDto =
    z.object({
        id: z.string().openapi({example: "1"}),
    })
    .openapi("IdParams");

const AttachmentParamsDto =
    z.object({
        id: z.string().openapi({example: "1"}),
        messageId: z.string().openapi({example: "8"}),
    })
    .openapi("AttachmentParams");

module.exports = { IdParamsDto, AttachmentParamsDto };
