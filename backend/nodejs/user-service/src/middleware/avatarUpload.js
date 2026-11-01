const multer = require("multer");

const avatarUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
    fileFilter: (req, file, callback) => {
        if (!/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
            callback(new Error("INVALID_TYPE"));
            return;
        }

        callback(null, true);
    },
}).single("avatar");

const handleAvatarUpload = (req, res, next) => {
    avatarUpload(req, res, (error) => {
        if (error) {
            return res.status(400).json({ message: "Bad request." });
        }

        next();
    });
};

module.exports = handleAvatarUpload;
