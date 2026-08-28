import chatApi from "./chatApi";

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

