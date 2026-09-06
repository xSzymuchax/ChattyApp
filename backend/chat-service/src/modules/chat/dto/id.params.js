const z = require("../../../config/zod");

const IdParamsDto =
    z.object({
        id: z.string().openapi({example: "1"}),
    })
    .openapi("IdParams");

module.exports = { IdParamsDto };
