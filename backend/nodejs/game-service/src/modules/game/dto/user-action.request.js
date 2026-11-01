const z = require("../../../config/zod");

const UserActionRequestDto =
    z.object({
        userId: z.int().openapi({ example: 1 }),
    })
    .openapi("UserActionRequestDto");

module.exports = { UserActionRequestDto };
