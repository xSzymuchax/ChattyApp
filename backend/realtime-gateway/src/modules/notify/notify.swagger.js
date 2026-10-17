const { OpenAPIRegistry } = require("@asteasolutions/zod-to-openapi");

const { NotifyRequestDto } = require("./dto/notify.request");

const registry = new OpenAPIRegistry();

registry.registerPath({
    method: "post",
    path: "/notify",
    tags: ["Notify"],
    summary: "Push a frame to a connected user.",
    description:
        "Used by other services. The gateway sends `{ type, message }` on that user's WebSocket. " +
        "The response is 204 even when the user has no open socket. Frame types are described at /asyncapi.",

    request: {
        body: {
            content: {
                "application/json": {
                    schema: NotifyRequestDto,
                },
            },
        },
    },

    responses: {
        204: {
            description: "The notify request was accepted. No response body.",
        },
    },
});

module.exports = registry;
