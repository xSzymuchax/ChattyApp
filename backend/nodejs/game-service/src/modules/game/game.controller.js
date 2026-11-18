const gameService = require("./game.service");

const parsePositiveInt = (value) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const parseBodyUserId = (value) =>
    typeof value === "number" ? parsePositiveInt(value) : null;

const parseRoomId = (value) => {
    if (typeof value !== "string" || !value.trim())
        return null;

    return value.trim();
};

const requesterId = (req) => parsePositiveInt(req.user?.userId);

const ownsRequest = (req, userId) => requesterId(req) === userId;

const createGameRoom = async (req, res) => {
    try {
        const firstUserId = parseBodyUserId(req.body.firstUserId);
        const secondUserId = parseBodyUserId(req.body.secondUserId);
        const { gameName } = req.body;

        if (
            !firstUserId ||
            !secondUserId ||
            firstUserId === secondUserId ||
            !gameService.allowedGameNames.includes(gameName)
        )
            return res.status(400).json({ message: "Bad request." });

        if (!ownsRequest(req, firstUserId))
            return res.status(403).json({ message: "Access denied." });

        const result = await gameService.createGameRoom({ gameName, firstUserId, secondUserId });

        if (result.error === "busy")
            return res.status(409).json({ message: "User is already in a game." });

        res.status(200).json(result.room);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error." });
    }
};

const getGameRoom = async (req, res) => {
    try {
        const id = parseRoomId(req.params.id);

        if (!id)
            return res.status(400).json({ message: "Bad request." });

        const result = await gameService.getGameRoom(id);

        if (!result)
            return res.status(404).json({ message: "Game room not found." });

        const callerId = requesterId(req);

        if (result.firstUserId !== callerId && result.secondUserId !== callerId)
            return res.status(403).json({ message: "Access denied." });

        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error." });
    }
};

const getUserGames = async (req, res) => {
    try {
        const userId = requesterId(req);

        if (!userId)
            return res.status(400).json({ message: "Bad request." });

        res.status(200).json(await gameService.getUserGames(userId));
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error." });
    }
};

const getInvitations = async (req, res) => {
    try {
        const userId = requesterId(req);

        if (!userId)
            return res.status(400).json({ message: "Bad request." });

        res.status(200).json(await gameService.getInvitations(userId));
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error." });
    }
};

const acceptInvitation = async (req, res) => {
    try {
        const id = parseRoomId(req.params.id);
        const userId = requesterId(req);

        if (!id || !userId || req.body?.status !== "active")
            return res.status(400).json({ message: "Bad request." });

        const result = await gameService.acceptInvitation(id, userId);

        if (result.error === "not_found")
            return res.status(404).json({ message: "Game room not found." });

        if (result.error === "forbidden")
            return res.status(403).json({ message: "Access denied." });

        res.status(200).json(result.room);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error." });
    }
};

const leaveGame = async (req, res) => {
    try {
        const id = parseRoomId(req.params.id);
        const userId = requesterId(req);

        if (!id || !userId)
            return res.status(400).json({ message: "Bad request." });

        const result = await gameService.leaveGame(id, userId);

        if (result.error === "not_found")
            return res.status(404).json({ message: "Game room not found." });

        if (result.error === "forbidden")
            return res.status(403).json({ message: "Access denied." });

        res.status(200).json(result.room);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error." });
    }
};

const makeMove = async (req, res) => {
    try {
        const id = parseRoomId(req.params.id);
        const userId = requesterId(req);
        const { move } = req.body;

        if (!id || !userId || move === undefined)
            return res.status(400).json({ message: "Bad request." });

        const result = await gameService.makeMove(id, { userId, move });

        if (result.error === "not_found")
            return res.status(404).json({ message: "Game room not found." });

        if (result.error === "forbidden")
            return res.status(403).json({ message: "Access denied." });

        if (result.error === "illegal" || result.error === "not_implemented")
            return res.status(400).json({ message: "Illegal move." });

        res.status(200).json(result.room);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = {
    createGameRoom,
    getGameRoom,
    getUserGames,
    getInvitations,
    acceptInvitation,
    leaveGame,
    makeMove,
};
