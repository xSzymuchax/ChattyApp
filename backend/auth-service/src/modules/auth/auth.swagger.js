const { OpenAPIRegistry } = require("@asteasolutions/zod-to-openapi");

const { AuthResponseDto } = require("./dto/auth-info.response");
const { TokenResponseDto } = require("./dto/token.response");
const { ErrorResponseDto } = require("./dto/error.response");
const { RegisterRequestDto } = require("./dto/register.request");
const { LoginRequestDto } = require("./dto/login.request");

const registry = new OpenAPIRegistry();

const errorContent = (example) => ({
    description: example,
    content: {
        "application/json": {
            schema: ErrorResponseDto,
            example: { message: example },
        },
    },
});

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
        201: {
            description: "User registered.",
            content: {
                "application/json": {
                    schema: AuthResponseDto,
                    example: { message: "User registered." },
                },
            },
        },
        400: errorContent("Bad request."),
        409: errorContent("Account exists."),
        500: errorContent("Internal server error."),
    },
});

registry.registerPath({
    method: "post",
    path: "/login",
    tags: ["Auth"],
    summary: "Log in and receive a JWT.",

    request: {
        body: {
            content: {
                "application/json": {
                    schema: LoginRequestDto,
                },
            },
        },
    },

    responses: {
        200: {
            description: "JWT for the authenticated user.",
            content: {
                "application/json": {
                    schema: TokenResponseDto,
                },
            },
        },
        404: errorContent("User not found."),
        500: errorContent("Internal server error."),
    },
});

module.exports = registry;
