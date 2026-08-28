const chatService = require("./chat.service");

const parsePositiveInt = (value) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const parseNonNegativeInt = (value) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
};

const createChat = async (req, res) => {
    try {
        console.log(req.body);
        const firstUserId = parsePositiveInt(req.body.firstUserId);
        const secondUserId = parsePositiveInt(req.body.secondUserId);

        if (!firstUserId || !secondUserId || firstUserId === secondUserId)
            return res.status(400).json({message: "Bad request."});

        const result = await chatService.createChat({ firstUserId, secondUserId });

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
        const senderId = parsePositiveInt(req.body.senderId);
        const { content } = req.body;

        if (!chatId || !senderId || !content)
            return res.status(400).json({message: "Bad request."});

        const result = await chatService.createMessage(chatId, { senderId, content });

        if (result.error === "not_found")
            return res.status(404).json({message: "Chat not found."});

        if (result.error === "forbidden")
            return res.status(403).json({message: "Access denied."});

        res.status(200).json(result.message);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal server error."});
    }
};

const getMessages = async (req, res) => {
    try {
        const chatId = parsePositiveInt(req.params.id);
        const start = parseNonNegativeInt(req.body.start);
        const end = parseNonNegativeInt(req.body.end);

        if (!chatId || start === null || end === null || start > end)
            return res.status(400).json({message: "Bad request."});

        const result = await chatService.getMessages(chatId, start, end);

        if (!result)
            return res.status(404).json({message: "Chat not found."});

        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal server error."});
    }
};

const getUserChats = async (req,res) => {
    try {
        const chatId = parsePositiveInt(req.params.id);

        if (!chatId)
            return res.status(400).json({message: "Bad request."});

        const result = await chatService.getUserChats(chatId);

        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal server error."});
    }
}

module.exports = {
    createChat,
    createMessage,
    getMessages,
    getUserChats
};
