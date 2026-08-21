const z = require("../../../config/zod");

const AuthDataRequestDto =  
    z.object({
        email: z.string().openapi({example: "Janex@example.org"}),
        password: z.string().openapi({example: "Password1@"}),
        passwordConfirm: z.string().openapi({example: "Password1@"}),
    })
    .openapi("UserDataRequestDto");

module.exports = { AuthDataRequestDto };