const z = require("../../../config/zod");

const IdParamsDto =
    z.object({
        id: z.string().openapi({ example: "3f1a2c8e-4b9d-4e2a-9c1b-8a7f6e5d4c3b" }),
    })
    .openapi("IdParams");

module.exports = { IdParamsDto };
