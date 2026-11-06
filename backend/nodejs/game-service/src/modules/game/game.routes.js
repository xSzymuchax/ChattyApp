const express = require("express");
const controller = require("./game.controller");
const checkAuth = require("../../middleware/auth");

const router = express.Router();

router.use(checkAuth);

router.get("/invitations", controller.getInvitations);
router.get("/", controller.getUserGames);
router.get("/:id", controller.getGameRoom);

router.post("/", controller.createGameRoom);
router.patch("/:id", controller.acceptInvitation);
router.delete("/:id", controller.leaveGame);
router.post("/:id/moves", controller.makeMove);

module.exports = router;
