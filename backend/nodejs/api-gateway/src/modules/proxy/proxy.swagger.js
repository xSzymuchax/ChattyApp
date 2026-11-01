const { OpenAPIRegistry } = require("@asteasolutions/zod-to-openapi");

const { ProxyPathParamsDto } = require("./dto/proxy-path.params");

const registry = new OpenAPIRegistry();

const methods = ["get", "post", "put", "patch", "delete"];

const mounts = [
    {
        prefix: "auth",
        tag: "Auth",
        summary: "Forward to the auth service.",
        description:
            "Client path /auth/<path> is proxied to AUTH_SERVICE_URL. " +
            "Request and response shapes are documented by that service at its /swagger. " +
            "Examples: POST /auth/register, POST /auth/login, POST /auth/refresh.",
    },
    {
        prefix: "user",
        tag: "User",
        summary: "Forward to the user service.",
        description:
            "Client path /user/<path> is proxied to USER_SERVICE_URL. " +
            "Request and response shapes are documented by that service at its /swagger. " +
            "Examples: GET /user, GET /user/7, PUT /user/7, POST /user/userOfEmailActive.",
    },
    {
        prefix: "chat",
        tag: "Chat",
        summary: "Forward to the chat service.",
        description:
            "Client path /chat/<path> is proxied to CHAT_SERVICE_URL. " +
            "The proxy waits up to 180 seconds, which covers attachment uploads. " +
            "Request and response shapes are documented by that service at its /swagger. " +
            "Examples: POST /chat, POST /chat/4/message, GET /chat/4/messages/8/attachment.",
    },
    {
        prefix: "game",
        tag: "Game",
        summary: "Forward to the game service.",
        description:
            "Client path /game/<path> is proxied to GAME_SERVICE_URL. " +
            "Request and response shapes are documented by that service at its /swagger. " +
            "Examples: POST /game, GET /game/userGames/7, POST /game/{roomId}/move.",
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
