const chatService = require("./chat.service");

const parsePositiveInt = (value) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const parseBodyInt = (value, minimum) => {
    if (typeof value !== "number" || !Number.isInteger(value) || value < minimum)
        return null;

    return value;
};

const createChat = async (req, res) => {
    try {
        console.log(req.body);
        const firstUserId = parseBodyInt(req.body.firstUserId, 1);
        const secondUserId = parseBodyInt(req.body.secondUserId, 1);

        const requesterId = parsePositiveInt(req.user?.userId);

        if (!firstUserId || !secondUserId || firstUserId === secondUserId || !requesterId)
            return res.status(400).json({message: "Bad request."});

        const result = await chatService.createChat(
            { firstUserId, secondUserId },
            requesterId
        );

        if (result?.error === "forbidden")
            return res.status(403).json({message: "Access denied."});

        if (!result)
            return res.status(409).json({message: "Chat between those users already exists."});

        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal server error."});
    }
};

const createMessage = async (req, res) => {
    try {
        const chatId = parsePositiveInt(req.params.id);
        const senderId = parsePositiveInt(req.user?.userId);
        const { content } = req.body;

        console.log(chatId, senderId, content);

        if (!chatId || !senderId || !content)
            return res.status(400).json({message: "Bad request."});

        const result = await chatService.createMessage(chatId, { senderId, content });

        if (result.error === "not_found")
            return res.status(404).json({message: "Chat not found."});

        if (result.error === "forbidden")
            return res.status(403).json({message: "Access denied."});

        res.status(200).json({
            message: result.message, 
            recipientId: result.recipientId
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal server error."});
    }
};

const createAttachment = async (req, res) => {
    try {
        const chatId = parsePositiveInt(req.params.id);
        const senderId = parsePositiveInt(req.user?.userId);

        if (!chatId || !senderId || !req.file)
            return res.status(400).json({message: "Bad request."});

        const result = await chatService.createAttachment(chatId, {
            senderId,
            file: req.file,
        });

        if (result.error === "not_found")
            return res.status(404).json({message: "Chat not found."});

        if (result.error === "forbidden")
            return res.status(403).json({message: "Access denied."});

        if (result.error === "bad_request")
            return res.status(400).json({message: "Bad request."});

        res.status(200).json({
            message: result.message,
            recipientId: result.recipientId,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal server error."});
    }
};

const getAttachment = async (req, res) => {
    try {
        const chatId = parsePositiveInt(req.params.id);
        const messageId = parsePositiveInt(req.params.messageId);
        const userId = parsePositiveInt(req.user?.userId);

        if (!chatId || !messageId || !userId)
            return res.status(400).json({message: "Bad request."});

        const result = await chatService.getAttachment(chatId, messageId, userId);

        if (result.error === "not_found")
            return res.status(404).json({message: "Attachment not found."});

        if (result.error === "forbidden")
            return res.status(403).json({message: "Access denied."});

        const buffer = Buffer.isBuffer(result.buffer)
            ? result.buffer
            : Buffer.from(result.buffer);

        res.setHeader("Content-Type", result.mime);
        res.setHeader(
            "Content-Disposition",
            `inline; filename*=UTF-8''${encodeURIComponent(result.name)}`
        );
        return res.status(200).send(buffer);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal server error."});
    }
};

const getMessages = async (req, res) => {
    try {
        const chatId = parsePositiveInt(req.params.id);
        const requesterId = parsePositiveInt(req.user?.userId);
        const start = parseBodyInt(req.body.start, 0);
        const end = parseBodyInt(req.body.end, 0);

        if (!chatId || !requesterId || start === null || end === null || start > end)
            return res.status(400).json({message: "Bad request."});

        const result = await chatService.getMessages(chatId, start, end, requesterId);

        if (result?.error === "forbidden")
            return res.status(403).json({message: "Access denied."});

        if (!result || result.error === "not_found")
            return res.status(404).json({message: "Chat not found."});

        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal server error."});
    }
};

const getUserChats = async (req,res) => {
    try {
        const userId = parsePositiveInt(req.params.id);
        const requesterId = parsePositiveInt(req.user?.userId);

        if (!userId || !requesterId)
            return res.status(400).json({message: "Bad request."});

        const result = await chatService.getUserChats(userId, requesterId);

        if (result?.error === "forbidden")
            return res.status(403).json({message: "Access denied."});

        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal server error."});
    }
}

const getChat = async (req, res) => {
    try {
        const chatId = parsePositiveInt(req.params.id);
        const requesterId = parsePositiveInt(req.user?.userId);

        if (!chatId || !requesterId)
            return res.status(400).json({message: "Bad request."});

        const result = await chatService.getChatById(chatId, requesterId);

        if (result?.error === "forbidden")
            return res.status(403).json({message: "Access denied."});

        if (!result)
            return res.status(404).json({message: "Chat not found."});

        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal server error."});
    }
};

module.exports = {
    createChat,
    createMessage,
    createAttachment,
    getAttachment,
    getMessages,
    getUserChats,
    getChat
};
