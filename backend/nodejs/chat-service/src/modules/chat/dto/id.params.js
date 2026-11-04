const z = require("../../../config/zod");

const IdParamsDto =
    z.object({
        id: z.string().openapi({example: "1"}),
    })
    .openapi("IdParams");

const MemberParamsDto =
    z.object({
        id: z.string().openapi({example: "1"}),
        userId: z.string().openapi({example: "3"}),
    })
    .openapi("MemberParams");

const AttachmentParamsDto =
    z.object({
        id: z.string().openapi({example: "1"}),
        messageId: z.string().openapi({example: "8"}),
    })
    .openapi("AttachmentParams");

module.exports = { IdParamsDto, MemberParamsDto, AttachmentParamsDto };
