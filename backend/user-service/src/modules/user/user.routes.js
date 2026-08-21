const express = require("express");
const controller = require("./user.controller");
const checkAuth = require("../../middleware/auth");

const router = express.Router();

router.get("/", controller.getUsers);
router.get("/:id", controller.getUser);
router.post("/", controller.createUser);
router.put("/:id", checkAuth, controller.updateUser);
router.delete("/:id", checkAuth, controller.deleteUser);
router.post("/userOfEmailActive", controller.checkUserExistByEmail);

module.exports = router;