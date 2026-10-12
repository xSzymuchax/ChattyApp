const fs = require("fs/promises");
const path = require("path");

const uploadDir = () =>
    process.env.UPLOAD_DIR || path.join(__dirname, "../../uploads");

const filePathFor = (messageId) =>
    path.join(uploadDir(), `${Number(messageId)}`);

const saveAttachment = async (messageId, buffer) => {
    await fs.mkdir(uploadDir(), { recursive: true });
    await fs.writeFile(filePathFor(messageId), buffer);
};

const readAttachment = async (messageId) => {
    try {
        return await fs.readFile(filePathFor(messageId));
    } catch (error) {
        if (error.code === "ENOENT") {
            return null;
        }

        throw error;
    }
};

module.exports = {
    saveAttachment,
    readAttachment,
};
