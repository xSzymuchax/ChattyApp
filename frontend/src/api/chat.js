import chatApi from "./chatApi";

export const findChatBetweenUsers = (chats, firstUserId, secondUserId) => {
    const firstId = Number(firstUserId);
    const secondId = Number(secondUserId);

    return (chats ?? []).find((chat) => {
        const chatFirstId = Number(chat.firstUserId);
        const chatSecondId = Number(chat.secondUserId);

        return (
            (chatFirstId === firstId && chatSecondId === secondId) ||
            (chatFirstId === secondId && chatSecondId === firstId)
        );
    });
};

export const createChat = (firstUserId, secondUserId) => {
    return chatApi.post('/chat', {
        firstUserId: firstUserId,
        secondUserId: secondUserId
    });
}

export const getUserChats = (userID) => {
    return chatApi.get(`/chat/userChats/${userID}`);
}

export const getChat = (chatId) => {
    return chatApi.get(`/chat/${chatId}`);
}

export const getMessagesFromChat = (chatId, start, end) => {
    return chatApi.post(`/chat/${chatId}/messages`, {
        start: start,
        end: end
    });
}

export const uploadChatAttachment = (chatId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    return chatApi.post(`/chat/${chatId}/attachment`, formData, {
        timeout: 180000,
    });
}

export const getChatAttachment = (chatId, messageId) => {
    return chatApi.get(`/chat/${chatId}/messages/${messageId}/attachment`, {
        responseType: "blob",
        timeout: 180000,
    });
}

