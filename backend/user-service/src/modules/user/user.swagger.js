const { OpenAPIRegistry } = require("@asteasolutions/zod-to-openapi");

const { UserInfoResponseDto } = require("./dto/user-info.response");
const { UserListResponseDto } = require("./dto/user-list.response");
const { ErrorResponseDto } = require("./dto/error.response");
const { UserDataRequestDto } = require("./dto/user-data.request");
const { UserIdParamsDto } = require("./dto/user-id.params");
const { UsernameQueryDto } = require("./dto/username.query");
const { EmailRequestDto } = require("./dto/email.request");
const { AuthErrorResponseDto } = require("./dto/auth-error.response");
const { DeleteUserResponseDto } = require("./dto/delete-user.response");

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
    method: "get",
    path: "/",
    tags: ["User"],
    summary: "Get users, optionally filtered by username.",

    request: {
        query: UsernameQueryDto,
    },

    responses: {
        200: {
            description: "List of matching users, limited to 10.",
            content: {
                "application/json": {
                    schema: UserListResponseDto,
                },
            },
        },
        500: errorContent("Internal server error."),
    },
});

registry.registerPath({
    method: "get",
    path: "/{id}",
    tags: ["User"],
    summary: "Get user of given id.",

    request: {
        params: UserIdParamsDto,
    },

    responses: {
        200: {
            description: "User of given id.",
            content: {
                "application/json": {
                    schema: UserInfoResponseDto,
                },
            },
        },
        400: errorContent("Bad request."),
        404: errorContent("User not found."),
        500: errorContent("Internal server error."),
    },
});

registry.registerPath({
    method: "post",
    path: "/",
    tags: ["User"],
    summary: "Create user account with given data.",

    request: {
        body: {
            content: {
                "application/json": {
                    schema: UserDataRequestDto,
                },
            },
        },
    },

    responses: {
        200: {
            description: "Created user.",
            content: {
                "application/json": {
                    schema: UserInfoResponseDto,
                },
            },
        },
        400: errorContent("Bad request."),
        409: errorContent("Account with that username/email exists."),
        500: errorContent("Internal server error."),
    },
});

registry.registerPath({
    method: "put",
    path: "/{id}",
    tags: ["User"],
    summary: "Update user account with given data. Requires Bearer token of that user.",

    request: {
        params: UserIdParamsDto,
        body: {
            content: {
                "application/json": {
                    schema: UserDataRequestDto,
                },
            },
        },
    },

    responses: {
        200: {
            description: "Updated user.",
            content: {
                "application/json": {
                    schema: UserInfoResponseDto,
                },
            },
        },
        400: errorContent("Bad request."),
        401: {
            description: "Missing or invalid authorization token.",
            content: {
                "application/json": {
                    schema: AuthErrorResponseDto,
                    example: { error: "Authorization header missing" },
                },
            },
        },
        403: errorContent("Access denied."),
        404: errorContent("User not found."),
        500: errorContent("Internal server error."),
    },
});

registry.registerPath({
    method: "delete",
    path: "/{id}",
    tags: ["User"],
    summary: "Soft delete user from system. Requires Bearer token of that user.",

    request: {
        params: UserIdParamsDto,
    },

    responses: {
        200: {
            description: "User removed.",
            content: {
                "application/json": {
                    schema: DeleteUserResponseDto,
                    example: true,
                },
            },
        },
        400: errorContent("Bad request."),
        401: {
            description: "Missing or invalid authorization token.",
            content: {
                "application/json": {
                    schema: AuthErrorResponseDto,
                    example: { error: "Authorization header missing" },
                },
            },
        },
        403: errorContent("Access denied."),
        404: errorContent("User not found."),
        500: errorContent("Internal server error."),
    },
});

registry.registerPath({
    method: "post",
    path: "/userOfEmailActive",
    tags: ["User"],
    summary: "Check if user with given email is still active.",

    request: {
        body: {
            content: {
                "application/json": {
                    schema: EmailRequestDto,
                },
            },
        },
    },

    responses: {
        200: {
            description: "Active user with given email.",
            content: {
                "application/json": {
                    schema: UserInfoResponseDto,
                },
            },
        },
        404: errorContent("User not found."),
        500: errorContent("Internal server error."),
    },
});

module.exports = registry;
