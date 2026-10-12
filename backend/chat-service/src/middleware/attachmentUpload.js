const multer = require("multer");
const { MAX_FILE_SIZE } = require("../util/attachment");

const attachmentUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
}).single("file");

const handleAttachmentUpload = (req, res, next) => {
    attachmentUpload(req, res, (error) => {
        if (error) {
            if (error.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({ message: "File is too large." });
            }

            return res.status(400).json({ message: "Bad request." });
        }

        next();
    });
};

module.exports = handleAttachmentUpload;
