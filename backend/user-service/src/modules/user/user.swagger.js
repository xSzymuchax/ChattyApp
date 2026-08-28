const { OpenAPIRegistry } = require("@asteasolutions/zod-to-openapi");

const { UserInfoResponseDto } = require("../user/dto/user-info.response");
const { ErrorResponseDto } = require("../user/dto/error.response");

const { UserDataRequestDto } = require("../user/dto/user-data.request");

const registry = new OpenAPIRegistry();

// TODO

registry.registerPath({
    method: "get",
    path: "/",
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


registry.registerPath({
    method: "get",
    path: "/:id",
    tags: ["User"],
    summary: "Get user of given id.",

    responses: {
        200: {
            description: "Get user of given id.",
            content: {
                "application/json": {
                    schema: UserInfoResponseDto,
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
        404: {
            description: "User of given id is not existing.",
            content: {
                "application/json": {
                    schema: ErrorResponseDto,
                    example: {
                        message: "User not found.",
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
            description: "Get user of given id.",
            content: {
                "application/json": {
                    schema: UserInfoResponseDto,
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


registry.registerPath({
    method: "put",
    path: "/:id",
    tags: ["User"],
    summary: "Update user account with given data.",

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
            description: "Get user of given id.",
            content: {
                "application/json": {
                    schema: UserInfoResponseDto,
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
        403: {
            description: "User doesn't have privileges to access or change data.",
            content: {
                "application/json": {
                    schema: ErrorResponseDto,
                    example: {
                        message: "Access denied.",
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



registry.registerPath({
    method: "delete",
    path: "/:id",
    tags: ["User"],
    summary: "Soft delete user from system.",

    responses: {
        200: {
            description: "User removed.",
            content: {
                "application/json": {
                    example: {}
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
        403: {
            description: "User doesn't have privileges to access or change data.",
            content: {
                "application/json": {
                    schema: ErrorResponseDto,
                    example: {
                        message: "Access denied.",
                    }
                },
            },
        },
        404: {
            description: "User of given id is not existing.",
            content: {
                "application/json": {
                    schema: ErrorResponseDto,
                    example: {
                        message: "User not found.",
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

// TODO
registry.registerPath({
    method: "post",
    path: "/userOfEmailActive",
    tags: ["User"],
    summary: "Check if user with given email is still active.",
    
    responses: {
        200: {
            description: "User exists.",
            content: {
                "application/json": {
                    example: {
                        message: "TODO"
                    },
                },
            },
        },
    },
});

module.exports = registry;
