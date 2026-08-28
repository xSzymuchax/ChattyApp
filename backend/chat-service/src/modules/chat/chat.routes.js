const express = require("express");
const controller = require("./chat.controller");

const router = express.Router();

router.get("/userChats/:id", controller.getUserChats);

router.post("/", controller.createChat);
router.post("/:id/message", controller.createMessage);
router.post("/:id/messages", controller.getMessages);


module.exports = router;
