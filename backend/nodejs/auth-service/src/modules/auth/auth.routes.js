const express = require("express");
const controller = require("./auth.controller");
const checkAuth = require("../../middleware/auth");
const { rateLimit, clientIp } = require("../../middleware/rateLimit");
const router = express.Router();

const authAttemptLimit = rateLimit({
    action: "auth",
    limit: Number(process.env.AUTH_RATE_LIMIT || 5),
    windowSeconds: Number(process.env.AUTH_RATE_WINDOW_SECONDS || 30),
    identity: clientIp,
});
const refreshLimit = rateLimit({
    action: "auth-refresh",
    limit: Number(process.env.AUTH_REFRESH_RATE_LIMIT || 10),
    windowSeconds: Number(process.env.AUTH_REFRESH_RATE_WINDOW_SECONDS || 30),
    identity: clientIp,
});

router.post("/register", authAttemptLimit, controller.register);
router.post("/login", authAttemptLimit, controller.login);
router.post("/refresh", refreshLimit, checkAuth, controller.refresh);

module.exports = router;