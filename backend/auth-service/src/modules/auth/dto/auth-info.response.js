const z = require("../../../config/zod");

const AuthResponseDto = 
    z.object({
        message: z.string().openapi({example: "User registered."}),
    })
    .openapi("AuthResponse");

module.exports = {
    AuthResponseDto
};