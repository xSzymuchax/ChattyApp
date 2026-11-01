const z = require("../../../config/zod");

const UpdateUserRequestDto =
    z.object({
        description: z.string().openapi({ example: "Lecimy do przodu!" }),
    })
    .openapi("UpdateUserRequestDto");

module.exports = { UpdateUserRequestDto };
