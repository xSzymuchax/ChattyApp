const express = require("express");
const controller = require("./user.controller");
const checkAuth = require("../../middleware/auth");
const checkInternal = require("../../middleware/internalAuth");

const router = express.Router();

router.get("/", checkAuth, controller.getUsers);
router.get("/:id/avatar", controller.getAvatar);
router.put("/:id/avatar", checkAuth, controller.handleAvatarUpload, controller.updateAvatar);
router.get("/:id", checkAuth, controller.getUser);
router.post("/", checkInternal, controller.createUser);
router.put("/:id", checkAuth, controller.updateUser);
router.delete("/:id", checkAuth, controller.deleteUser);
router.post("/userOfEmailActive", checkInternal, controller.checkUserExistByEmail);

module.exports = router;