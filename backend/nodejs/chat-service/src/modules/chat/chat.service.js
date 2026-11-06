const { Chat, Message } = require("../../models");
const createChatRepository = require("./chat.repository");
const { serializeMessage } = require("../../util/messageView");
const { processAttachment } = require("../../util/attachment");
const { saveAttachment, readAttachment } = require("../../util/fileStore");
const chatRepository = createChatRepository(Chat, Message);

const MAX_MEMBERS = 50;
const MAX_NAME_LENGTH = 80;

const asIdList = (value) =>
    (Array.isArray(value) ? value : [])
        .map(Number)
        .filter((id) => Number.isInteger(id) && id > 0);

const uniqueSorted = (ids) => [...new Set(asIdList(ids))].sort((left, right) => left - right);

const includesId = (ids, userId) =>
    uniqueSorted(ids).includes(Number(userId));

const isParticipant = (chat, userId) => includesId(chat?.memberIds, userId);

const isAdmin = (chat, userId) => includesId(chat?.adminIds, userId);

const otherMemberIds = (chat, userId) =>
    uniqueSorted(chat?.memberIds).filter((id) => id !== Number(userId));

const toPublicChat = (chat) => {
    const json = typeof chat?.toJSON === "function" ? chat.toJSON() : chat;

    if (!json) return null;

    return {
        id: json.id,
        name: json.name ?? null,
        createdBy: Number(json.createdBy),
        memberIds: uniqueSorted(json.memberIds),
        adminIds: uniqueSorted(json.adminIds),
    };
};

const realtimeGatewayUrl = () => {
    if (process.env.REALTIME_GATEWAY_URL)
        return process.env.REALTIME_GATEWAY_URL;

    if (process.env.NODE_ENV === "test")
        return "";

    return "http://localhost:3300";
};

const notifyRealtime = (userId, type, message) => {
    const url = realtimeGatewayUrl();

    if (!url || !userId || !message) {
        return;
    }

    fetch(`${url}/notify`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Internal-Token": process.env.INTERNAL_SERVICE_TOKEN || "",
        },
        body: JSON.stringify({
            userId,
            type,
            message,
        }),
    }).catch(() => {});
};

const notifyEach = (userIds, type, message) => {
    for (const userId of userIds) {
        notifyRealtime(userId, type, message);
    }
};

const normalizeName = (name) => {
    if (name === undefined || name === null) return null;
    if (typeof name !== "string") return undefined;

    const trimmed = name.trim();
    return trimmed.length ? trimmed : null;
};

const chatService = {
    async createChat(data, requesterId) {
        const memberIds = uniqueSorted(data.memberIds);
        const name = normalizeName(data.name);
        const creatorId = Number(requesterId);

        if (name === undefined) return { error: "bad_request" };

        if (!memberIds.includes(creatorId)) return { error: "forbidden" };

        if (!name) {
            if (memberIds.length !== 2) return { error: "bad_request" };

            const existingChat = await chatRepository.getDirectChatByMemberIds(memberIds);

            if (existingChat) return null;
        } else if (name.length > MAX_NAME_LENGTH || memberIds.length < 3 || memberIds.length > MAX_MEMBERS) {
            return { error: "bad_request" };
        }

        const created = await chatRepository.createChat({
            memberIds,
            adminIds: [creatorId],
            name,
            createdBy: creatorId,
            active: true,
        });
        const chat = toPublicChat(created);

        notifyEach(otherMemberIds(chat, creatorId), "chatCreated", chat);
        return chat;
    },

    async createMessage(chatId, data) {
        const chat = await chatRepository.getChatById(chatId);

        if (!chat) return { error: "not_found" };

        if (!isParticipant(chat, data.senderId)) return { error: "forbidden" };

        const message = await chatRepository.createMessage({
            chatId,
            senderId: data.senderId,
            content: data.content,
        });

        return {
            message: serializeMessage(message),
            recipientIds: otherMemberIds(chat, data.senderId),
        };
    },

    async createAttachment(chatId, { senderId, file }) {
        const chat = await chatRepository.getChatById(chatId);

        if (!chat) return { error: "not_found" };

        if (!isParticipant(chat, senderId)) return { error: "forbidden" };

        if (!file?.buffer) return { error: "bad_request" };

        const processed = await processAttachment(file);
        const message = await chatRepository.createMessage({
            chatId,
            senderId,
            content: processed.originalName,
            attachmentName: processed.originalName,
            attachmentMime: processed.mime,
            attachmentSize: processed.size,
            attachmentKind: processed.kind,
        });

        await saveAttachment(message.id, processed.buffer);

        const serialized = serializeMessage(message);
        const recipientIds = otherMemberIds(chat, senderId);

        for (const recipientId of recipientIds) {
            notifyRealtime(recipientId, "message", serialized);
        }

        return { message: serialized, recipientIds };
    },

    async getAttachment(chatId, messageId, userId) {
        const chat = await chatRepository.getChatById(chatId);

        if (!chat) return { error: "not_found" };

        if (!isParticipant(chat, userId)) return { error: "forbidden" };

        const message = await chatRepository.getMessageById(messageId);

        if (!message || Number(message.chatId) !== Number(chatId) || !message.attachmentName) {
            return { error: "not_found" };
        }

        const buffer = await readAttachment(message.id);

        if (!buffer) return { error: "not_found" };

        return {
            buffer,
            name: message.attachmentName,
            mime: message.attachmentMime || "application/octet-stream",
        };
    },

    async getMessages(chatId, start, end, requesterId) {
        const chat = await chatRepository.getChatById(chatId);

        if (!chat) return { error: "not_found" };

        if (!isParticipant(chat, requesterId)) return { error: "forbidden" };

        if (start === end) return [];

        const messages = await chatRepository.getMessagesByRange(chatId, start, end);
        return messages.map(serializeMessage);
    },

    async getUserChats(userId, requesterId) {
        if (Number(userId) !== Number(requesterId)) {
            return { error: "forbidden" };
        }

        return chatRepository.getUserChats(userId);
    },

    async getChatById(id, requesterId) {
        const chat = await chatRepository.getChatById(id);

        if (!chat) return null;

        if (!isParticipant(chat, requesterId)) return { error: "forbidden" };

        return toPublicChat(chat);
    },

    async addMember(chatId, requesterId, userId) {
        const chat = await chatRepository.getChatById(chatId);

        if (!chat) return { error: "not_found" };

        if (!chat.name) return { error: "bad_request" };

        if (!isParticipant(chat, requesterId)) return { error: "forbidden" };

        const nextUserId = Number(userId);

        if (isParticipant(chat, nextUserId)) return { error: "conflict" };

        if (chat.memberIds.length >= MAX_MEMBERS) return { error: "bad_request" };

        const updated = await chatRepository.updateChat(chatId, {
            memberIds: uniqueSorted([...chat.memberIds, nextUserId]),
        });

        notifyRealtime(nextUserId, "chatCreated", updated);
        notifyEach(chat.memberIds, "chatUpdated", updated);
        return updated;
    },

    async removeMember(chatId, requesterId, userId) {
        const chat = await chatRepository.getChatById(chatId);

        if (!chat) return { error: "not_found" };

        if (!chat.name) return { error: "bad_request" };

        if (!isParticipant(chat, requesterId)) return { error: "forbidden" };

        const targetId = Number(userId);

        if (!isParticipant(chat, targetId)) return { error: "not_member" };

        if (targetId !== Number(requesterId) && !isAdmin(chat, requesterId)) {
            return { error: "forbidden" };
        }

        const memberIds = chat.memberIds.filter((id) => id !== targetId);
        const adminIds = chat.adminIds.filter((id) => id !== targetId);

        if (memberIds.length === 0) {
            await chatRepository.updateChat(chatId, { memberIds, adminIds, active: false });
            notifyRealtime(targetId, "chatRemoved", { id: chat.id });
            return { id: chat.id };
        }

        const updated = await chatRepository.updateChat(chatId, { memberIds, adminIds });

        notifyRealtime(targetId, "chatRemoved", { id: chat.id });
        notifyEach(memberIds, "chatUpdated", updated);
        return updated;
    },

    async grantAdmin(chatId, requesterId, userId) {
        const chat = await chatRepository.getChatById(chatId);

        if (!chat) return { error: "not_found" };

        if (!chat.name) return { error: "bad_request" };

        if (!isAdmin(chat, requesterId)) return { error: "forbidden" };

        const targetId = Number(userId);

        if (!isParticipant(chat, targetId)) return { error: "not_member" };

        if (isAdmin(chat, targetId)) return chat;

        const updated = await chatRepository.updateChat(chatId, {
            adminIds: uniqueSorted([...chat.adminIds, targetId]),
        });

        notifyEach(updated.memberIds, "chatUpdated", updated);
        return updated;
    },

    async deleteChat(chatId, requesterId) {
        const chat = await chatRepository.getChatById(chatId);

        if (!chat) return { error: "not_found" };

        if (!chat.name) return { error: "bad_request" };

        if (!isAdmin(chat, requesterId)) return { error: "forbidden" };

        await chatRepository.deactivateChat(chat.id);
        notifyEach(chat.memberIds, "chatDeleted", { id: chat.id });
        return { id: chat.id };
    },
};

module.exports = chatService;
