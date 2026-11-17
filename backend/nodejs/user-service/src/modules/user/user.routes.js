const express = require("express");
const controller = require("./user.controller");
const checkAuth = require("../../middleware/auth");
const checkInternal = require("../../middleware/internalAuth");
const { rateLimit, userId, clientIp } = require("../../middleware/rateLimit");

const router = express.Router();

const searchLimit = rateLimit({
    action: "user-search",
    limit: Number(process.env.USER_SEARCH_RATE_LIMIT || 20),
    windowSeconds: Number(process.env.USER_SEARCH_RATE_WINDOW_SECONDS || 30),
    identity: (req) => req.query.username === undefined ? null : userId(req),
});
const avatarReadLimit = rateLimit({
    action: "avatar-read",
    limit: Number(process.env.AVATAR_READ_RATE_LIMIT || 30),
    windowSeconds: Number(process.env.AVATAR_READ_RATE_WINDOW_SECONDS || 30),
    identity: clientIp,
});
const avatarWriteLimit = rateLimit({
    action: "user-avatar-write",
    limit: Number(process.env.AVATAR_WRITE_RATE_LIMIT || 5),
    windowSeconds: Number(process.env.AVATAR_WRITE_RATE_WINDOW_SECONDS || 60),
    identity: userId,
});

router.get("/", checkAuth, searchLimit, controller.getUsers);
router.get("/:id/avatar", avatarReadLimit, controller.getAvatar);
router.put("/:id/avatar", checkAuth, avatarWriteLimit, controller.handleAvatarUpload, controller.updateAvatar);
router.get("/:id", checkAuth, controller.getUser);
router.post("/", checkInternal, controller.createUser);
router.put("/:id", checkAuth, controller.updateUser);
router.delete("/:id", checkAuth, controller.deleteUser);
router.post("/userOfEmailActive", checkInternal, controller.checkUserExistByEmail);

module.exports = router;