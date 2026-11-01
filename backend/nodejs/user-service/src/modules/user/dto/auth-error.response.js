const z = require("../../../config/zod");

const AuthErrorResponseDto =
    z.object({
        message: z.string().openapi({example: "Invalid or expired token."}),
    })
    .openapi("AuthErrorResponse");

module.exports = { AuthErrorResponseDto };
