import chatApi from "./chatApi";

export const createChat = (firstUserId, secondUserId) => {
    return chatApi.post('/chat', {
        firstUserId: firstUserId,
        secondUserId: secondUserId
    });
}

export const getUserChats = (userID) => {
    return chatApi.get('/chat/:id');
}

