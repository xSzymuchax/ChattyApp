const sharp = require("sharp");

const AVATAR_SIZE = 128;

const processAvatar = async (buffer) => {
    return sharp(buffer)
        .rotate()
        .resize(AVATAR_SIZE, AVATAR_SIZE, {
            fit: "cover",
            position: "centre",
        })
        .webp({ quality: 80 })
        .toBuffer();
};

module.exports = {
    processAvatar,
};
