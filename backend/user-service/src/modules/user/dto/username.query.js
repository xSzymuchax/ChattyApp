const z = require("../../../config/zod");

const UsernameQueryDto =
    z.object({
        username: z.string().optional().openapi({example: "Jan"}),
    })
    .openapi("UsernameQuery");

module.exports = { UsernameQueryDto };
