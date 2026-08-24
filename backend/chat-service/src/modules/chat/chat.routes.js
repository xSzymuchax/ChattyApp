const express = require("express");
const controller = require("./chat.controller");

const router = express.Router();

router.post("/", controller.createChat);
router.post("/:id/message", controller.createMessage);
router.post("/:id/messages", controller.getMessages);

module.exports = router;
