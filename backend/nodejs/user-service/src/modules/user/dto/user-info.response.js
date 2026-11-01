const z = require("../../../config/zod");

const UserInfoResponseDto = 
    z.object({
        id: z.int().openapi({example: 1}),
        username: z.string().openapi({example: "Janex"}),
        description: z.string().nullable().openapi({example: "Lecimy do przodu!"}),
        email: z.string().openapi({example: "Janex@example.org"}),
        hasAvatar: z.boolean().openapi({example: false}),
        updatedAt: z.string().openapi({example: "2026-01-01T00:00:00.000Z"}),
    })
    .openapi("UserInfoResponse");

module.exports = {
    UserInfoResponseDto
};