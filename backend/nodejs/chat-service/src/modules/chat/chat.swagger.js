const { OpenAPIRegistry } = require("@asteasolutions/zod-to-openapi");

const { ChatInfoResponseDto } = require("./dto/chat-info.response");
const { ChatListResponseDto } = require("./dto/chat-list.response");
const { ChatDataRequestDto } = require("./dto/chat-data.request");
const { MessageDataRequestDto } = require("./dto/message-data.request");
const { MessagesRangeRequestDto } = require("./dto/messages-range.request");
const { MessageListResponseDto } = require("./dto/message-list.response");
const { CreateMessageResponseDto } = require("./dto/create-message.response");
const { IdParamsDto, AttachmentParamsDto } = require("./dto/id.params");
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

const unauthorized = {
    description: "Missing or invalid authorization token.",
    content: {
        "application/json": {
            schema: ErrorResponseDto,
            example: { message: "Invalid or expired token." },
        },
    },
};

const fileTooLarge = {
    description: "The upload is invalid, or the file exceeds 50 MB.",
    content: {
        "application/json": {
            schema: ErrorResponseDto,
            examples: {
                badRequest: { value: { message: "Bad request." } },
                tooLarge: { value: { message: "File is too large." } },
            },
        },
    },
};

registry.registerPath({
    method: "get",
    path: "/userChats/{id}",
    tags: ["Chat"],
    summary: "Get all chats that include the signed-in user. Requires a Bearer token.",

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
        401: unauthorized,
        403: errorContent("Access denied."),
        500: errorContent("Internal server error."),
    },
});

registry.registerPath({
    method: "get",
    path: "/{id}",
    tags: ["Chat"],
    summary: "Get a chat when the caller is one of its participants. Requires a Bearer token.",

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
        401: unauthorized,
        403: errorContent("Access denied."),
        404: errorContent("Chat not found."),
        500: errorContent("Internal server error."),
    },
});

registry.registerPath({
    method: "post",
    path: "/",
    tags: ["Chat"],
    summary: "Create a chat between the signed-in user and somebody else. The other user receives a chatCreated WebSocket frame.",

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
        401: unauthorized,
        403: errorContent("Access denied."),
        409: errorContent("Chat between those users already exists."),
        500: errorContent("Internal server error."),
    },
});

registry.registerPath({
    method: "post",
    path: "/{id}/message",
    tags: ["Chat"],
    summary: "Create a text message as the signed-in user. The other participant receives a message WebSocket frame from the realtime gateway.",

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
        401: unauthorized,
        403: errorContent("Access denied."),
        404: errorContent("Chat not found."),
        500: errorContent("Internal server error."),
    },
});

registry.registerPath({
    method: "post",
    path: "/{id}/attachment",
    tags: ["Chat"],
    summary: "Upload an attachment or image (max 50 MB) as the signed-in user. Images are compressed to WebP. The other participant receives a message WebSocket frame.",

    request: {
        params: IdParamsDto,
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
        400: fileTooLarge,
        401: unauthorized,
        403: errorContent("Access denied."),
        404: errorContent("Chat not found."),
        500: errorContent("Internal server error."),
    },
});

registry.registerPath({
    method: "get",
    path: "/{id}/messages/{messageId}/attachment",
    tags: ["Chat"],
    summary: "Download a message attachment. Requires a Bearer token of a participant.",

    request: {
        params: AttachmentParamsDto,
    },

    responses: {
        200: {
            description: "Attachment file.",
        },
        400: errorContent("Bad request."),
        401: unauthorized,
        403: errorContent("Access denied."),
        404: errorContent("Attachment not found."),
        500: errorContent("Internal server error."),
    },
});

registry.registerPath({
    method: "post",
    path: "/{id}/messages",
    tags: ["Chat"],
    summary: "Get the latest messages in a chat for a participant. start and end are integers counting from the newest message (start inclusive, end exclusive).",

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
        401: unauthorized,
        403: errorContent("Access denied."),
        404: errorContent("Chat not found."),
        500: errorContent("Internal server error."),
    },
});

module.exports = registry;
