const { OpenAPIRegistry } = require("@asteasolutions/zod-to-openapi");

const { ChatInfoResponseDto } = require("./dto/chat-info.response");
const { ChatListResponseDto } = require("./dto/chat-list.response");
const { ChatDataRequestDto } = require("./dto/chat-data.request");
const { MessageDataRequestDto } = require("./dto/message-data.request");
const { MessagesRangeRequestDto } = require("./dto/messages-range.request");
const { MessageListResponseDto } = require("./dto/message-list.response");
const { CreateMessageResponseDto } = require("./dto/create-message.response");
const { IdParamsDto } = require("./dto/id.params");
const { ErrorResponseDto } = require("./dto/error.response");

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
    path: "/userChats/{id}",
    tags: ["Chat"],
    summary: "Get all chats that include the given user id.",

    request: {
        params: IdParamsDto,
    },

    responses: {
        200: {
            description: "Chats of the given user.",
            content: {
                "application/json": {
                    schema: ChatListResponseDto,
                },
            },
        },
        400: errorContent("Bad request."),
        500: errorContent("Internal server error."),
    },
});

registry.registerPath({
    method: "get",
    path: "/{id}",
    tags: ["Chat"],
    summary: "Get chat of given id.",

    request: {
        params: IdParamsDto,
    },

    responses: {
        200: {
            description: "Chat of given id.",
            content: {
                "application/json": {
                    schema: ChatInfoResponseDto,
                },
            },
        },
        400: errorContent("Bad request."),
        404: errorContent("Chat not found."),
        500: errorContent("Internal server error."),
    },
});

registry.registerPath({
    method: "post",
    path: "/",
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
        400: errorContent("Bad request."),
        409: errorContent("Chat between those users already exists."),
        500: errorContent("Internal server error."),
    },
});

registry.registerPath({
    method: "post",
    path: "/{id}/message",
    tags: ["Chat"],
    summary: "Create a message in a chat.",

    request: {
        params: IdParamsDto,
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
            description: "Created message and recipient user id.",
            content: {
                "application/json": {
                    schema: CreateMessageResponseDto,
                },
            },
        },
        400: errorContent("Bad request."),
        403: errorContent("Access denied."),
        404: errorContent("Chat not found."),
        500: errorContent("Internal server error."),
    },
});

registry.registerPath({
    method: "post",
    path: "/{id}/messages",
    tags: ["Chat"],
    summary: "Get the latest messages in a chat. start/end count from the newest message (start inclusive, end exclusive).",

    request: {
        params: IdParamsDto,
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
                    schema: MessageListResponseDto,
                },
            },
        },
        400: errorContent("Bad request."),
        404: errorContent("Chat not found."),
        500: errorContent("Internal server error."),
    },
});

module.exports = registry;
