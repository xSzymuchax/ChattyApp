const express = require("express");
const controller = require("./chat.controller");
const checkAuth = require("../../middleware/auth");
const handleAttachmentUpload = require("../../middleware/attachmentUpload");
const { rateLimit, userId } = require("../../middleware/rateLimit");

const router = express.Router();

const chatCreateLimit = rateLimit({
    action: "chat-create",
    limit: Number(process.env.CHAT_CREATE_RATE_LIMIT || 10),
    windowSeconds: Number(process.env.CHAT_CREATE_RATE_WINDOW_SECONDS || 60),
    identity: userId,
});
const memberLimit = rateLimit({
    action: "chat-member",
    limit: Number(process.env.CHAT_MEMBER_RATE_LIMIT || 50),
    windowSeconds: Number(process.env.CHAT_MEMBER_RATE_WINDOW_SECONDS || 60),
    identity: userId,
});
const messageLimit = rateLimit({
    action: "chat-message",
    limit: Number(process.env.CHAT_MESSAGE_RATE_LIMIT || 20),
    windowSeconds: Number(process.env.CHAT_MESSAGE_RATE_WINDOW_SECONDS || 30),
    identity: userId,
});
const attachmentLimit = rateLimit({
    action: "chat-attachment",
    limit: Number(process.env.CHAT_ATTACHMENT_RATE_LIMIT || 5),
    windowSeconds: Number(process.env.CHAT_ATTACHMENT_RATE_WINDOW_SECONDS || 60),
    identity: userId,
});

router.use(checkAuth);

router.get("/", controller.getUserChats);
router.get("/:id/messages/:messageId/attachment", controller.getAttachment);
router.put("/:id/admins/:userId", controller.grantAdmin);
router.post("/:id/members", memberLimit, controller.addMember);
router.delete("/:id/members/:userId", controller.removeMember);
router.delete("/:id", controller.deleteChat);
router.get("/:id", controller.getChat);

router.post("/", chatCreateLimit, controller.createChat);
router.post("/:id/messages", messageLimit, controller.createMessage);
router.get("/:id/messages", controller.getMessages);
router.post("/:id/attachment", attachmentLimit, handleAttachmentUpload, controller.createAttachment);


module.exports = router;
