const express = require("express");
const controller = require("./auth.controller");
const checkAuth = require("../../middleware/auth");
const router = express.Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/refresh", checkAuth, controller.refresh);

module.exports = router;