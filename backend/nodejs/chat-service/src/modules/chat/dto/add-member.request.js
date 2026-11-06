const z = require("../../../config/zod");

const AddMemberRequestDto =
    z.object({
        userId: z.int().openapi({example: 3}),
    })
    .openapi("AddMemberRequest");

module.exports = { AddMemberRequestDto };
