const z = require("../../../config/zod");

const LoginRequestDto =  
    z.object({
        email: z.string().openapi({example: "Janex@example.org"}),
        password: z.string().openapi({example: "Password1@"}),
    })
    .openapi("LoginRequestDto");

module.exports = { LoginRequestDto };