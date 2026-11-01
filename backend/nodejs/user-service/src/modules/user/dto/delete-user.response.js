const z = require("../../../config/zod");

const DeleteUserResponseDto =
    z.boolean().openapi({example: true});

module.exports = { DeleteUserResponseDto };
