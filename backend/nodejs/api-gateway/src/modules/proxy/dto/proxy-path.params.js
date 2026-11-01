const z = require("../../../config/zod");

const ProxyPathParamsDto = z
    .object({
        path: z.string().openapi({
            example: "login",
            description: "Downstream path. Further segments are forwarded, for example user/7/avatar.",
        }),
    })
    .openapi("ProxyPathParams");

module.exports = {
    ProxyPathParamsDto,
};
