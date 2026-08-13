const express = require("express");
const controller = require("./user.controller");
const router = express.Router();

router.get("/", controller.getUsers);
router.get("/:id", controller.getUser);
router.post("/", controller.createUser);
router.put("/:id", controller.updateUser);
router.delete("/:id", controller.deleteUser);
router.post("/userOfEmailActive", controller.checkUserExistByEmail);


module.exports = router;