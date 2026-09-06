const z = require("../../../config/zod");

const AuthErrorResponseDto =
    z.object({
        error: z.string().openapi({example: "Authorization header missing"}),
    })
    .openapi("AuthErrorResponse");

module.exports = { AuthErrorResponseDto };
