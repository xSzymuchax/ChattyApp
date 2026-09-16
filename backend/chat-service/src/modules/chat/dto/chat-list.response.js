const z = require("../../../config/zod");
const { ChatInfoResponseDto } = require("./chat-info.response");

const ChatListItemResponseDto =
    ChatInfoResponseDto.extend({
        lastMessageId: z.int().nullable().openapi({example: 12}),
        lastMessageContent: z.string().nullable().openapi({example: "Hello!"}),
        lastMessageSenderId: z.int().nullable().openapi({example: 1}),
        lastMessageCreatedAt: z.string().nullable().openapi({example: "2026-09-15T15:04:00.000Z"}),
    })
    .openapi("ChatListItemResponse");

const ChatListResponseDto =
    z.array(ChatListItemResponseDto).openapi("ChatListResponse");

module.exports = { ChatListItemResponseDto, ChatListResponseDto };
