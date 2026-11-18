const express = require("express");
const controller = require("./game.controller");
const checkAuth = require("../../middleware/auth");
const { rateLimit, userId } = require("../../middleware/rateLimit");

const router = express.Router();

const gameCreateLimit = rateLimit({
    action: "game-create",
    limit: Number(process.env.GAME_CREATE_RATE_LIMIT || 10),
    windowSeconds: Number(process.env.GAME_CREATE_RATE_WINDOW_SECONDS || 60),
    identity: userId,
});
const gameMoveLimit = rateLimit({
    action: "game-move",
    limit: Number(process.env.GAME_MOVE_RATE_LIMIT || 30),
    windowSeconds: Number(process.env.GAME_MOVE_RATE_WINDOW_SECONDS || 30),
    identity: userId,
});

router.use(checkAuth);

router.get("/invitations", controller.getInvitations);
router.get("/", controller.getUserGames);
router.get("/:id", controller.getGameRoom);

router.post("/", gameCreateLimit, controller.createGameRoom);
router.patch("/:id", controller.acceptInvitation);
router.delete("/:id", controller.leaveGame);
router.post("/:id/moves", gameMoveLimit, controller.makeMove);

module.exports = router;
