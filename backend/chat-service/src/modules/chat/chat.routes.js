const express = require("express");
const controller = require("./chat.controller");
const checkAuth = require("../../middleware/auth");
const handleAttachmentUpload = require("../../middleware/attachmentUpload");

const router = express.Router();

router.use(checkAuth);

router.get("/userChats/:id", controller.getUserChats);
router.get("/:id/messages/:messageId/attachment", controller.getAttachment);
router.get("/:id", controller.getChat);

router.post("/", controller.createChat);
router.post("/:id/message", controller.createMessage);
router.post("/:id/messages", controller.getMessages);
router.post(
    "/:id/attachment",
    handleAttachmentUpload,
    controller.createAttachment
);


module.exports = router;
