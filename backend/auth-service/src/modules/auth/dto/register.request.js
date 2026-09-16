const z = require("../../../config/zod");

const RegisterRequestDto =  
    z.object({
        username: z.string().openapi({example: "Janex_the_third"}),
        email: z.string().openapi({example: "Janex@example.org"}),
        password: z.string()
            .min(8)
            .regex(/[a-z]/)
            .regex(/[A-Z]/)
            .regex(/\d/)
            .regex(/[^A-Za-z0-9]/)
            .openapi({
                example: "Password1@",
                description: "At least 8 characters, with upper and lower case, a digit, and a special character.",
            }),
        passwordConfirm: z.string().openapi({example: "Password1@"}),
    })
    .openapi("RegisterRequestDto");

module.exports = { RegisterRequestDto };