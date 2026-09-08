const { OpenAPIRegistry } = require("@asteasolutions/zod-to-openapi");

const { HealthResponseDto } = require("./dto/health-response.dto");

const registry = new OpenAPIRegistry();

registry.registerPath({
  method: "get",
  path: "/health",
  tags: ["Health"],
  summary: "Check service health",

  responses: {
    200: {
      description: "Service is healthy.",
      content: {
        "application/json": {
          schema: HealthResponseDto,
        },
      },
    },
  },
});

module.exports = registry;