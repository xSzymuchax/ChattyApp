const userService = require("./user.service");
const { processAvatar } = require("../../util/avatar");
const { UniqueConstraintError } = require("sequelize");
const handleAvatarUpload = require("../../middleware/avatarUpload");

const getUsers = async (req, res) => {
    try{
        const { username } = req.query;
        console.log("USERNAME: ", username);

        const result = await userService.getUsers(username);
        res.status(200).json(result);
    } catch (error){
        console.log(error);
        res.status(500).json({
            message: "Internal server error."
        });
    }
    
};
// CRUD

//C
const createUser = async (req, res) => {
    try {
        const { username, email, description, password, confirmPassword } = req.body;

        if (!username || !email)
            return res.status(400).json({message: "Bad request."});

        const result = await userService.createUser({username, email, description});
    
        if (!result)
            return res.status(409).json({message: "Account with that username/email exists."});

        res.status(200).json(result);
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            return res.status(409).json({
                message: "Account with that username/email exists.",
            });
        }
        console.log(error);
        res.status(500).json({message: "Internal server error."});
    }
};

//R
const getUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || Number.isNaN(id) || id <= 0) 
            return res.status(400).json({message: "Bad request."});

        const result = await userService.getUserById(id);

        if (!result) 
            return res.status(404).json({message: "User not found."});

        res.status(200).json(result);
    } catch (error){
        console.log(error);
        res.status(500).json({message: "Internal server error."});
    }
};

const getAvatar = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || Number.isNaN(id) || id <= 0)
            return res.status(400).json({ message: "Bad request." });

        const result = await userService.getUserAvatar(id);

        if (result?.error === "not_found")
            return res.status(404).json({ message: "User not found." });

        if (result?.error === "no_avatar")
            return res.status(404).json({ message: "Avatar not found." });

        const buffer = Buffer.isBuffer(result.buffer)
            ? result.buffer
            : Buffer.from(result.buffer);

        res.setHeader("Content-Type", "image/webp");
        res.setHeader("Cache-Control", "private, max-age=60");
        return res.status(200).send(buffer);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error." });
    }
};

const updateAvatar = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        if (id != userId)
            return res.status(403).json({ message: "Access denied." });

        if (!id || Number.isNaN(id) || id <= 0)
            return res.status(400).json({ message: "Bad request." });

        if (!req.file?.buffer)
            return res.status(400).json({ message: "Bad request." });

        const avatar = await processAvatar(req.file.buffer);
        const result = await userService.updateUserAvatar(id, avatar);

        if (!result)
            return res.status(404).json({ message: "User not found." });

        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error." });
    }
};

//U
// TODO - data checking
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { description } = req.body;

        const userId = req.user.userId;

        if (id != userId)
            return res.status(403).json({message: "Access denied."})

        if (!id || Number.isNaN(id) || id <= 0) 
            return res.status(400).json({message: "Bad request."});

        const result = await userService.updateUser(id, {description});
    
        if (!result)
            return res.status(404).json({message: "User not found."});

        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal server error."})
    }
};

//D
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        console.log(id);
        console.log(userId);

        if (id != userId)
            return res.status(403).json({message: "Access denied."})

        if (!id || Number.isNaN(id) || id <= 0) 
            return res.status(400).json({message: "Bad request."});

        const result = await userService.deleteUser(id);
    
        if (!result)
            return res.status(404).json({message: "User not found."});

        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal server error."});
    }
};

const checkUserExistByEmail = async (req, res) => {
    try {
        const { email } = req.body;

        const result = await userService.checkUserExist(email);

        if (!result)
            return res.status(404).json({message: "User not found."});

        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal server error."});
    }
}

module.exports = {
    createUser,
    getUsers,
    getUser,
    getAvatar,
    handleAvatarUpload,
    updateAvatar,
    updateUser,
    deleteUser,
    checkUserExistByEmail
};
