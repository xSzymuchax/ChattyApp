const { lastMessagePreview, serializeMessage } = require("../../../src/util/messageView");

describe("messageView", () => {
    it("returns null for a missing message", () => {
        expect(serializeMessage(null)).toBeNull();
        expect(lastMessagePreview(null)).toBeNull();
    });

    it("previews text, images, and files", () => {
        expect(lastMessagePreview({ content: "hello" })).toBe("hello");
        expect(lastMessagePreview({ attachmentKind: "image", content: "ignored" })).toBe("Image");
        expect(lastMessagePreview({
            attachmentKind: "file",
            attachmentName: "notes.txt",
        })).toBe("notes.txt");
        expect(lastMessagePreview({})).toBeNull();
    });

    it("copies a plain message and nests attachment fields", () => {
        const serialized = serializeMessage({
            id: 4,
            chatId: 2,
            senderId: 7,
            content: "photo",
            createdAt: "now",
            updatedAt: "now",
            attachmentName: "photo.webp",
            attachmentMime: "image/webp",
            attachmentSize: 12,
            attachmentKind: "image",
        });

        expect(serialized.attachment).toEqual({
            name: "photo.webp",
            mime: "image/webp",
            size: 12,
            kind: "image",
        });
    });
});
