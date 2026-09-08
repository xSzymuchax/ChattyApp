const z = require("../../../config/zod");

const UserIdParamsDto =
    z.object({
        id: z.string().openapi({ example: "1" }),
    })
    .openapi("UserIdParams");

module.exports = { UserIdParamsDto };
