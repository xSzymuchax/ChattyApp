const z = require("../../../config/zod");

const UserDataRequestDto =  
    z.object({
        username: z.string().openapi({example: "Janex"}),
        description: z.string().openapi({example: "Lecimy do przodu!"}),
        email: z.string().openapi({example: "Janex@example.org"}),
    })
    .openapi("UserDataRequestDto");

module.exports = { UserDataRequestDto };