const z = require("../../../config/zod");

const RegisterRequestDto =  
    z.object({
        username: z.string().openapi({example: "Janex_the_third"}),
        email: z.string().openapi({example: "Janex@example.org"}),
        password: z.string().openapi({example: "Password1@"}),
        passwordConfirm: z.string().openapi({example: "Password1@"}),
    })
    .openapi("RegisterRequestDto");

module.exports = { RegisterRequestDto };