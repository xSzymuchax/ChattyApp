const path = require("path");
const sharp = require("sharp");

const MAX_IMAGE_EDGE = 1920;
const IMAGE_QUALITY = 75;
const IMAGE_TYPES = /\/(jpeg|png|webp|gif|bmp|tiff)$/i;

const safeFileName = (name) => {
    const base = path.basename(String(name || "file")).replace(/[\r\n]/g, "");
    return base.slice(0, 255) || "file";
};

const isImage = (mimetype) => IMAGE_TYPES.test(mimetype || "");

const processAttachment = async (file) => {
    const originalName = safeFileName(file.originalname);
    const originalMime = file.mimetype || "application/octet-stream";

    if (!isImage(originalMime)) {
        return {
            buffer: file.buffer,
            originalName,
            mime: originalMime,
            size: file.buffer.length,
            kind: "file",
        };
    }

    try {
        const compressed = await sharp(file.buffer)
            .rotate()
            .resize(MAX_IMAGE_EDGE, MAX_IMAGE_EDGE, {
                fit: "inside",
                withoutEnlargement: true,
            })
            .webp({ quality: IMAGE_QUALITY })
            .toBuffer();

        return {
            buffer: compressed,
            originalName: originalName.replace(/\.[^.]+$/, "") + ".webp",
            mime: "image/webp",
            size: compressed.length,
            kind: "image",
        };
    } catch {
        return {
            buffer: file.buffer,
            originalName,
            mime: originalMime,
            size: file.buffer.length,
            kind: "file",
        };
    }
};

module.exports = {
    processAttachment,
    MAX_FILE_SIZE: 50 * 1024 * 1024,
};
