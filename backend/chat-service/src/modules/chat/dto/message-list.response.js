const z = require("../../../config/zod");
const { MessageInfoResponseDto } = require("./message-info.response");

const MessageListResponseDto =
    z.array(MessageInfoResponseDto).openapi("MessageListResponse");

module.exports = { MessageListResponseDto };
