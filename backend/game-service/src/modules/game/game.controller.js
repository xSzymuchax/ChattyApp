const gameService = require("./game.service");

const parsePositiveInt = (value) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const parseRoomId = (value) => {
    if (typeof value !== "string" || !value.trim())
        return null;

    return value.trim();
};

const createGameRoom = (req, res) => {
    try {
        const firstUserId = parsePositiveInt(req.body.firstUserId);
        const secondUserId = parsePositiveInt(req.body.secondUserId);
        const { gameName } = req.body;

        if (
            !firstUserId ||
            !secondUserId ||
            firstUserId === secondUserId ||
            !gameService.allowedGameNames.includes(gameName)
        )
            return res.status(400).json({ message: "Bad request." });

        const result = gameService.createGameRoom({ gameName, firstUserId, secondUserId });

        if (result.error === "busy")
            return res.status(409).json({ message: "User is already in a game." });

        res.status(200).json(result.room);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error." });
    }
};

const getGameRoom = (req, res) => {
    try {
        const id = parseRoomId(req.params.id);

        if (!id)
            return res.status(400).json({ message: "Bad request." });

        const result = gameService.getGameRoom(id);

        if (!result)
            return res.status(404).json({ message: "Game room not found." });

        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error." });
    }
};

const getUserGames = (req, res) => {
    try {
        const userId = parsePositiveInt(req.params.id);

        if (!userId)
            return res.status(400).json({ message: "Bad request." });

        res.status(200).json(gameService.getUserGames(userId));
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error." });
    }
};

const getInvitations = (req, res) => {
    try {
        const userId = parsePositiveInt(req.params.id);

        if (!userId)
            return res.status(400).json({ message: "Bad request." });

        res.status(200).json(gameService.getInvitations(userId));
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error." });
    }
};

const acceptInvitation = (req, res) => {
    try {
        const id = parseRoomId(req.params.id);
        const userId = parsePositiveInt(req.body.userId);

        if (!id || !userId)
            return res.status(400).json({ message: "Bad request." });

        const result = gameService.acceptInvitation(id, userId);

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

const leaveGame = (req, res) => {
    try {
        const id = parseRoomId(req.params.id);
        const userId = parsePositiveInt(req.body.userId);

        if (!id || !userId)
            return res.status(400).json({ message: "Bad request." });

        const result = gameService.leaveGame(id, userId);

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

const makeMove = (req, res) => {
    try {
        const id = parseRoomId(req.params.id);
        const userId = parsePositiveInt(req.body.userId);
        const { move } = req.body;

        if (!id || !userId || move === undefined)
            return res.status(400).json({ message: "Bad request." });

        const result = gameService.makeMove(id, { userId, move });

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
