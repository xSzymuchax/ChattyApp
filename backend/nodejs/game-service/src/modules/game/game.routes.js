const express = require("express");
const controller = require("./game.controller");

const router = express.Router();

router.get("/invitations/:id", controller.getInvitations);
router.get("/userGames/:id", controller.getUserGames);
router.get("/:id", controller.getGameRoom);

router.post("/", controller.createGameRoom);
router.post("/:id/accept", controller.acceptInvitation);
router.post("/:id/leave", controller.leaveGame);
router.post("/:id/move", controller.makeMove);

module.exports = router;
