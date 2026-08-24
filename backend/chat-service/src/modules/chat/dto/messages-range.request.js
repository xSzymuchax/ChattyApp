const z = require("../../../config/zod");

const MessagesRangeRequestDto =
    z.object({
        start: z.int().openapi({example: 0}),
        end: z.int().openapi({example: 20}),
    })
    .openapi("MessagesRangeRequestDto");

module.exports = { MessagesRangeRequestDto };
