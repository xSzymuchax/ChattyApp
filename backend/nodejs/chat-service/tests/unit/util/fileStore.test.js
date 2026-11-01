const fs = require("fs/promises");
const os = require("os");
const path = require("path");

const uploadDir = path.join(os.tmpdir(), `chatty-file-store-${process.pid}`);
process.env.UPLOAD_DIR = uploadDir;

const { saveAttachment, readAttachment } = require("../../../src/util/fileStore");

describe("fileStore", () => {
    afterAll(async () => {
        await fs.rm(uploadDir, { recursive: true, force: true });
    });

    it("returns null when the attachment is missing", async () => {
        await expect(readAttachment(404)).resolves.toBeNull();
    });

    it("writes a buffer and reads the same bytes back", async () => {
        const bytes = Buffer.from("attachment-bytes");

        await saveAttachment(8, bytes);

        await expect(readAttachment(8)).resolves.toEqual(bytes);
    });
});
