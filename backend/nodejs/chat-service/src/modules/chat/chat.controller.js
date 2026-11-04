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

const parseMemberIds = (value) => {
    if (!Array.isArray(value) || value.length === 0)
        return null;

    const memberIds = [];

    for (const item of value) {
        const parsed = parseBodyInt(item, 1);

        if (!parsed)
            return null;

        memberIds.push(parsed);
    }

    return memberIds;
};

const sendServiceError = (res, result, messages) => {
    if (result?.error === "forbidden") {
        res.status(403).json({message: "Access denied."});
        return true;
    }

    if (result?.error === "bad_request") {
        res.status(400).json({message: "Bad request."});
        return true;
    }

    if (result?.error === "conflict") {
        res.status(409).json({message: messages.conflict});
        return true;
    }

    if (result?.error === "not_member") {
        res.status(404).json({message: "Member not found."});
        return true;
    }

    if (!result || result.error === "not_found") {
        res.status(404).json({message: messages.notFound || "Chat not found."});
        return true;
    }

    return false;
};

const createChat = async (req, res) => {
    try {
        const requesterId = parsePositiveInt(req.user?.userId);
        const memberIds = parseMemberIds(req.body?.memberIds);
        const name = req.body?.name;

        if (!requesterId || !memberIds) {
            return res.status(400).json({message: "Bad request."});
        }

        if (name !== undefined && name !== null && typeof name !== "string") {
            return res.status(400).json({message: "Bad request."});
        }

        const result = await chatService.createChat(
            { memberIds, name },
            requesterId
        );

        if (result?.error === "forbidden")
            return res.status(403).json({message: "Access denied."});

        if (result?.error === "bad_request")
            return res.status(400).json({message: "Bad request."});

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
            recipientIds: result.recipientIds
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
            recipientIds: result.recipientIds,
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

const deleteChat = async (req, res) => {
    try {
        const chatId = parsePositiveInt(req.params.id);
        const requesterId = parsePositiveInt(req.user?.userId);

        if (!chatId || !requesterId)
            return res.status(400).json({message: "Bad request."});

        const result = await chatService.deleteChat(chatId, requesterId);

        if (sendServiceError(res, result, { notFound: "Chat not found." }))
            return;

        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal server error."});
    }
};

const addMember = async (req, res) => {
    try {
        const chatId = parsePositiveInt(req.params.id);
        const requesterId = parsePositiveInt(req.user?.userId);
        const userId = parseBodyInt(req.body?.userId, 1);

        if (!chatId || !requesterId || !userId)
            return res.status(400).json({message: "Bad request."});

        const result = await chatService.addMember(chatId, requesterId, userId);

        if (sendServiceError(res, result, { conflict: "User is already a member." }))
            return;

        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal server error."});
    }
};

const removeMember = async (req, res) => {
    try {
        const chatId = parsePositiveInt(req.params.id);
        const userId = parsePositiveInt(req.params.userId);
        const requesterId = parsePositiveInt(req.user?.userId);

        if (!chatId || !userId || !requesterId)
            return res.status(400).json({message: "Bad request."});

        const result = await chatService.removeMember(chatId, requesterId, userId);

        if (sendServiceError(res, result, { notFound: "Chat not found." }))
            return;

        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal server error."});
    }
};

const grantAdmin = async (req, res) => {
    try {
        const chatId = parsePositiveInt(req.params.id);
        const userId = parsePositiveInt(req.params.userId);
        const requesterId = parsePositiveInt(req.user?.userId);

        if (!chatId || !userId || !requesterId)
            return res.status(400).json({message: "Bad request."});

        const result = await chatService.grantAdmin(chatId, requesterId, userId);

        if (sendServiceError(res, result, { notFound: "Chat not found." }))
            return;

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
    getChat,
    addMember,
    removeMember,
    grantAdmin,
    deleteChat
};
