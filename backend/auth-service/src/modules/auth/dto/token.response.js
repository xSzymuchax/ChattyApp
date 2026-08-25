const z = require("../../../config/zod");

const TokenResponseDto = 
    z.object({
        token: z.string().openapi({example: "asdbahbdkawvdakfkankdawd..."}),
    })
    .openapi("AuthResponse");

module.exports = {
    TokenResponseDto
};