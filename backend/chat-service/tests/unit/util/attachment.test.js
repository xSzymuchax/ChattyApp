const { processAttachment } = require("../../../src/util/attachment");

describe("processAttachment", () => {
    it("keeps a non-image file and strips a path and newlines from the name", async () => {
        const result = await processAttachment({
            originalname: "..\\note\r\n.txt",
            mimetype: "text/plain",
            buffer: Buffer.from("abc"),
        });

        expect(result).toEqual({
            buffer: Buffer.from("abc"),
            originalName: "note.txt",
            mime: "text/plain",
            size: 3,
            kind: "file",
        });
    });

    it("falls back to a file when an image buffer cannot be decoded", async () => {
        const result = await processAttachment({
            originalname: "",
            mimetype: "image/png",
            buffer: Buffer.from("not-an-image"),
        });

        expect(result.kind).toBe("file");
        expect(result.originalName).toBe("file");
        expect(result.mime).toBe("image/png");
    });
});
