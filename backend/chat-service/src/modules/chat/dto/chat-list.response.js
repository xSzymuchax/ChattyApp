const z = require("../../../config/zod");
const { ChatInfoResponseDto } = require("./chat-info.response");

const ChatListResponseDto =
    z.array(ChatInfoResponseDto).openapi("ChatListResponse");

module.exports = { ChatListResponseDto };
