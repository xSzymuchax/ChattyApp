const z = require("../../../config/zod");

const EmailRequestDto =
    z.object({
        email: z.string().openapi({example: "Janex@example.org"}),
    })
    .openapi("EmailRequestDto");

module.exports = { EmailRequestDto };
