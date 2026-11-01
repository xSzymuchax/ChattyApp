const z = require("../../../config/zod");

const ErrorResponseDto = 
    z.object({
        message: z.string(),
    })
    .openapi("ErrorResponse");

module.exports = {
    ErrorResponseDto
};