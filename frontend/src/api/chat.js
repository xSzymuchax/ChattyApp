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

