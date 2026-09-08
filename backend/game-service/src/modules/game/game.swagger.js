const { OpenAPIRegistry } = require("@asteasolutions/zod-to-openapi");

const { GameInfoResponseDto, GameListResponseDto } = require("./dto/game-info.response");
const { GameDataRequestDto } = require("./dto/game-data.request");
const { MoveDataRequestDto } = require("./dto/move-data.request");
const { UserActionRequestDto } = require("./dto/user-action.request");
const { IdParamsDto } = require("./dto/id.params");
const { UserIdParamsDto } = require("./dto/user-id.params");
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

const userActionBody = {
    body: {
        content: {
            "application/json": {
                schema: UserActionRequestDto,
            },
        },
    },
};

registry.registerPath({
    method: "get",
    path: "/invitations/{id}",
    tags: ["Game"],
    summary: "Get pending game invitations for a user.",

    request: {
        params: UserIdParamsDto,
    },

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
    path: "/userGames/{id}",
    tags: ["Game"],
    summary: "Get game rooms that include the given user.",

    request: {
        params: UserIdParamsDto,
    },

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
    method: "post",
    path: "/{id}/accept",
    tags: ["Game"],
    summary: "Accept a pending game invitation.",

    request: {
        params: IdParamsDto,
        ...userActionBody,
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
    method: "post",
    path: "/{id}/leave",
    tags: ["Game"],
    summary: "Leave or decline a game room.",

    request: {
        params: IdParamsDto,
        ...userActionBody,
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
    path: "/{id}/move",
    tags: ["Game"],
    summary: "Submit a move. Game rules are applied by the rules catalog.",

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
        400: errorContent("Illegal move."),
        403: errorContent("Access denied."),
        404: errorContent("Game room not found."),
        500: errorContent("Internal server error."),
    },
});

module.exports = registry;
