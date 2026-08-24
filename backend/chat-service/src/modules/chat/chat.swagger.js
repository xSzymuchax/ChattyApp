const { OpenAPIRegistry } = require("@asteasolutions/zod-to-openapi");

const { ChatInfoResponseDto } = require("./dto/chat-info.response");
const { ChatDataRequestDto } = require("./dto/chat-data.request");
const { MessageInfoResponseDto } = require("./dto/message-info.response");
const { MessageDataRequestDto } = require("./dto/message-data.request");
const { MessagesRangeRequestDto } = require("./dto/messages-range.request");
const { ErrorResponseDto } = require("./dto/error.response");

const registry = new OpenAPIRegistry();

registry.registerPath({
    method: "post",
    path: "/chat",
    tags: ["Chat"],
    summary: "Create a chat between two users.",

    request: {
        body: {
            content: {
                "application/json": {
                    schema: ChatDataRequestDto,
                },
            },
        },
    },

    responses: {
        200: {
            description: "Created chat.",
            content: {
                "application/json": {
                    schema: ChatInfoResponseDto,
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
            description: "Chat between those users already exists.",
            content: {
                "application/json": {
                    schema: ErrorResponseDto,
                    example: {
                        message: "Chat between those users already exists.",
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
    path: "/chat/:id/message",
    tags: ["Chat"],
    summary: "Create a message in a chat.",

    request: {
        body: {
            content: {
                "application/json": {
                    schema: MessageDataRequestDto,
                },
            },
        },
    },

    responses: {
        200: {
            description: "Created message.",
            content: {
                "application/json": {
                    schema: MessageInfoResponseDto,
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
            description: "Sender is not a participant of the chat.",
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
            description: "Chat of given id is not existing.",
            content: {
                "application/json": {
                    schema: ErrorResponseDto,
                    example: {
                        message: "Chat not found.",
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
    path: "/chat/:id/messages",
    tags: ["Chat"],
    summary: "Get messages in a chat from index start (inclusive) to end (exclusive).",

    request: {
        body: {
            content: {
                "application/json": {
                    schema: MessagesRangeRequestDto,
                },
            },
        },
    },

    responses: {
        200: {
            description: "List of messages in the given range.",
            content: {
                "application/json": {
                    schema: MessageInfoResponseDto,
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
            description: "Chat of given id is not existing.",
            content: {
                "application/json": {
                    schema: ErrorResponseDto,
                    example: {
                        message: "Chat not found.",
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
