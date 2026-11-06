const { OpenAPIRegistry } = require("@asteasolutions/zod-to-openapi");

const { GameInfoResponseDto, GameListResponseDto } = require("./dto/game-info.response");
const { GameDataRequestDto } = require("./dto/game-data.request");
const { MoveDataRequestDto } = require("./dto/move-data.request");
const { GameStatusRequestDto } = require("./dto/game-status.request");
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
    path: "/invitations",
    tags: ["Game"],
    summary: "Get pending game invitations for the signed-in user.",

    responses: {
        200: {
            description: "Pending invitations.",
            content: {
                "application/json": {
                    schema: GameListResponseDto,
                },
            },
        },
        400: errorContent("Bad request."),
        500: errorContent("Internal server error."),
    },
});

registry.registerPath({
    method: "get",
    path: "/",
    tags: ["Game"],
    summary: "Get game rooms that include the signed-in user.",

    responses: {
        200: {
            description: "Game rooms of the given user.",
            content: {
                "application/json": {
                    schema: GameListResponseDto,
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
    tags: ["Game"],
    summary: "Get a game room by id.",

    request: {
        params: IdParamsDto,
    },

    responses: {
        200: {
            description: "Game room of given id.",
            content: {
                "application/json": {
                    schema: GameInfoResponseDto,
                },
            },
        },
        400: errorContent("Bad request."),
        404: errorContent("Game room not found."),
        500: errorContent("Internal server error."),
    },
});

registry.registerPath({
    method: "post",
    path: "/",
    tags: ["Game"],
    summary: "Create a pending game room.",

    request: {
        body: {
            content: {
                "application/json": {
                    schema: GameDataRequestDto,
                },
            },
        },
    },

    responses: {
        200: {
            description: "Created game room.",
            content: {
                "application/json": {
                    schema: GameInfoResponseDto,
                },
            },
        },
        400: errorContent("Bad request."),
        409: errorContent("User is already in a game."),
        500: errorContent("Internal server error."),
    },
});

registry.registerPath({
    method: "patch",
    path: "/{id}",
    tags: ["Game"],
    summary: "Accept a pending invitation by setting the room status to active.",

    request: {
        params: IdParamsDto,
        body: {
            content: {
                "application/json": {
                    schema: GameStatusRequestDto,
                },
            },
        },
    },

    responses: {
        200: {
            description: "Active game room.",
            content: {
                "application/json": {
                    schema: GameInfoResponseDto,
                },
            },
        },
        400: errorContent("Bad request."),
        403: errorContent("Access denied."),
        404: errorContent("Game room not found."),
        500: errorContent("Internal server error."),
    },
});

registry.registerPath({
    method: "delete",
    path: "/{id}",
    tags: ["Game"],
    summary: "Leave or decline a game room. The signed-in user must be a participant.",

    request: {
        params: IdParamsDto,
    },

    responses: {
        200: {
            description: "Left game.",
            content: {
                "application/json": {
                    schema: GameInfoResponseDto,
                },
            },
        },
        400: errorContent("Bad request."),
        403: errorContent("Access denied."),
        404: errorContent("Game room not found."),
        500: errorContent("Internal server error."),
    },
});

registry.registerPath({
    method: "post",
    path: "/{id}/moves",
    tags: ["Game"],
    summary: "Add a move for the signed-in user. Game rules are applied by the rules catalog.",

    request: {
        params: IdParamsDto,
        body: {
            content: {
                "application/json": {
                    schema: MoveDataRequestDto,
                },
            },
        },
    },

    responses: {
        200: {
            description: "Updated game room.",
            content: {
                "application/json": {
                    schema: GameInfoResponseDto,
                },
            },
        },
        400: {
            description: "The body is invalid, or the rules reject the move.",
            content: {
                "application/json": {
                    schema: ErrorResponseDto,
                    examples: {
                        badRequest: { value: { message: "Bad request." } },
                        illegalMove: { value: { message: "Illegal move." } },
                    },
                },
            },
        },
        403: errorContent("Access denied."),
        404: errorContent("Game room not found."),
        500: errorContent("Internal server error."),
    },
});

module.exports = registry;
