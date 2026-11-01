const z = require("../../../config/zod");

const HealthResponseDto = z
  .object({
    content: z.string().openapi({
      example: "Service running.",
    }),
  })
  .openapi("HealthResponse");

module.exports = {
  HealthResponseDto,
};