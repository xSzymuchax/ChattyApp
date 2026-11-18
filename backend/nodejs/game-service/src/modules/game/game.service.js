const crypto = require("crypto");
const gameRepository = require("./game.repository");
const { ALLOWED_GAME_NAMES } = require("./game.constants");
const { getRules } = require("./rules");

const toPublicRoom = (room) => ({
    id: room.id,
    gameName: room.gameName,
    firstUserId: room.firstUserId,
    secondUserId: room.secondUserId,
    status: room.status,
    gameState: room.gameState,
    moves: room.moves,
});

const isParticipant = (room, userId) =>
    Number(room.firstUserId) === Number(userId) ||
    Number(room.secondUserId) === Number(userId);

const userIsBusy = async (userId) =>
    (await gameRepository.findByUserId(userId)).length > 0;

const gameService = {
    allowedGameNames: ALLOWED_GAME_NAMES,

    async createGameRoom({ gameName, firstUserId, secondUserId }) {
        if (await userIsBusy(firstUserId) || await userIsBusy(secondUserId))
            return { error: "busy" };

        const rules = getRules(gameName);
        if (!rules)
            return { error: "bad_request" };

        const room = {
            id: crypto.randomUUID(),
            gameName,
            firstUserId,
            secondUserId,
            status: "pending",
            gameState: rules.createInitialState(),
            moves: [],
        };

        return { room: toPublicRoom(await gameRepository.create(room)) };
    },

    async getGameRoom(id) {
        const room = await gameRepository.findById(id);
        return room ? toPublicRoom(room) : null;
    },

    async getUserGames(userId) {
        return (await gameRepository.findByUserId(userId)).map(toPublicRoom);
    },

    async getInvitations(userId) {
        return (await gameRepository.findByUserId(userId))
            .filter((room) => room.status === "pending" && room.secondUserId === userId)
            .map(toPublicRoom);
    },

    async acceptInvitation(id, userId) {
        const room = await gameRepository.findById(id);

        if (!room)
            return { error: "not_found" };

        if (room.secondUserId !== userId || room.status !== "pending")
            return { error: "forbidden" };

        room.status = "active";
        await gameRepository.save(room);

        return { room: toPublicRoom(room) };
    },

    async leaveGame(id, userId) {
        const room = await gameRepository.findById(id);

        if (!room)
            return { error: "not_found" };

        if (!isParticipant(room, userId))
            return { error: "forbidden" };

        await gameRepository.delete(id);
        return { room: toPublicRoom(room) };
    },

    async makeMove(id, { userId, move }) {
        const room = await gameRepository.findById(id);

        if (!room)
            return { error: "not_found" };

        if (!isParticipant(room, userId) || room.status !== "active")
            return { error: "forbidden" };

        const rules = getRules(room.gameName);
        if (!rules)
            return { error: "bad_request" };

        const result = rules.applyMove(room.gameState, {
            userId,
            move,
            firstUserId: room.firstUserId,
            secondUserId: room.secondUserId,
        });

        if (result.error)
            return { error: result.error };

        room.gameState = result.gameState;
        room.moves.push({ userId, move });
        await gameRepository.save(room);

        return { room: toPublicRoom(room) };
    },
};

module.exports = gameService;
