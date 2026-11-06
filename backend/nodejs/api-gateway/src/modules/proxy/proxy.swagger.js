const { OpenAPIRegistry } = require("@asteasolutions/zod-to-openapi");

const { ProxyPathParamsDto } = require("./dto/proxy-path.params");

const registry = new OpenAPIRegistry();

const methods = ["get", "post", "put", "patch", "delete"];

const mounts = [
    {
        prefix: "v1/auth",
        tag: "Auth",
        summary: "Forward to the auth service.",
        description:
            "Client path /v1/auth/<path> is proxied to AUTH_SERVICE_URL. " +
            "Request and response shapes are documented by that service at its /swagger. " +
            "Examples: POST /v1/auth/register, POST /v1/auth/login, POST /v1/auth/refresh.",
    },
    {
        prefix: "v1/user",
        tag: "User",
        summary: "Forward to the user service.",
        description:
            "Client path /v1/user/<path> is proxied to USER_SERVICE_URL. " +
            "Request and response shapes are documented by that service at its /swagger. " +
            "Examples: GET /v1/user, GET /v1/user/7, PUT /v1/user/7, POST /v1/user/userOfEmailActive.",
    },
    {
        prefix: "v1/chat",
        tag: "Chat",
        summary: "Forward to the chat service.",
        description:
            "Client path /v1/chat/<path> is proxied to CHAT_SERVICE_URL. " +
            "The proxy waits up to 180 seconds, which covers attachment uploads. " +
            "Request and response shapes are documented by that service at its /swagger. " +
            "Examples: GET /v1/chat, POST /v1/chat, POST /v1/chat/4/messages, PUT /v1/chat/4/admins/7, DELETE /v1/chat/4.",
    },
    {
        prefix: "v1/game",
        tag: "Game",
        summary: "Forward to the game service.",
        description:
            "Client path /v1/game/<path> is proxied to GAME_SERVICE_URL. " +
            "Request and response shapes are documented by that service at its /swagger. " +
            "Examples: GET /v1/game, GET /v1/game/invitations, PATCH /v1/game/{roomId}, POST /v1/game/{roomId}/moves.",
    },
];

for (const mount of mounts) {
    for (const method of methods) {
        registry.registerPath({
            method,
            path: `/${mount.prefix}/{path}`,
            tags: [mount.tag],
            summary: mount.summary,
            description: mount.description,
            request: {
                params: ProxyPathParamsDto,
            },
            responses: {
                200: {
                    description: "Status and body produced by the downstream service.",
                },
            },
        });
    }
}

module.exports = registry;
