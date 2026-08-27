const { OpenAPIRegistry } = require("@asteasolutions/zod-to-openapi");

const { AuthResponseDto } = require("./dto/auth-info.response");
const { ErrorResponseDto } = require("./dto/error.response");

const { RegisterRequestDto } = require("./dto/register.request");

const registry = new OpenAPIRegistry();

// TODO


registry.registerPath({
    method: "post",
    path: "/register",
    tags: ["Auth"],
    summary: "Create login credentials for user.",

    request: {
        body: {
            content: {
                "application/json": {
                    schema: RegisterRequestDto,
                },
            },
        },
    },

    responses: {
        200: {
            description: "Returns information about created credentials.",
            content: {
                "application/json": {
                    schema: AuthResponseDto,
                },
            },
        },
        400: {
            description: "Server couldn't read request data.",
            content: {
                "application/json": {
                    schema: ErrorResponseDto,
                    example: {
                        message: "Bad request.",
                    }
                },
            },
        },
        409: {
            description: "Can't create account because of existence of one with same username or email.",
            content: {
                "application/json": {
                    schema: ErrorResponseDto,
                    example: {
                        message: "Account with that username/email exists.",
                    }
                },
            },
        },
        500: {
            description: "Internal server error.",
            content: {
                "application/json": {
                    schema: ErrorResponseDto,
                    example: {
                        message: "Internal server error.",
                    }
                },
            },
        },
    },
});

module.exports = registry;
