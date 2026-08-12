const { OpenAPIRegistry } = require("@asteasolutions/zod-to-openapi");
const { UserInfoResponseDto } = require("../user/dto/user-info.response");
const registry = new OpenAPIRegistry();

// TODO

registry.registerPath({
    method: "get",
    path: "/user",
    tags: ["User"],
    summary: "Gets all system users",

    responses: {
        200: {
            description: "List of users.",
            content: {
                "application/json": {
                    schema: UserInfoResponseDto,
                },
            },
        },
    },
});

module.exports = registry;
