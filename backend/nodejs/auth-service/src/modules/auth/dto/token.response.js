const z = require("../../../config/zod");

const TokenResponseDto = 
    z.object({
        token: z.string().openapi({example: "asdbahbdkawvdakfkankdawd..."}),
    })
    .openapi("TokenResponse");

module.exports = {
    TokenResponseDto
};