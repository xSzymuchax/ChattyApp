const z = require("../../../config/zod");
const { ChatInfoResponseDto } = require("./chat-info.response");

const ChatListItemResponseDto =
    ChatInfoResponseDto.extend({
        lastMessageId: z.int().nullable().openapi({example: 12}),
        lastMessageContent: z.string().nullable().openapi({example: "Hello!"}),
        lastMessageSenderId: z.int().nullable().openapi({example: 1}),
    })
    .openapi("ChatListItemResponse");

const ChatListResponseDto =
    z.array(ChatListItemResponseDto).openapi("ChatListResponse");

module.exports = { ChatListItemResponseDto, ChatListResponseDto };
