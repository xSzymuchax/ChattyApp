const z = require("../../../config/zod");

const UserInfoResponseDto = 
    z.object({
        id: z.int().openapi({example: 1}),
        username: z.string().openapi({example: "Janex"}),
        description: z.string().openapi({example: "Lecimy do przodu!"}),
        email: z.string().openapi({example: "Janex@example.org"}),
    })
    .openapi("UserInfoResponse");

module.exports = {
    UserInfoResponseDto
};