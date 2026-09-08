import gameApi from "./gameApi";

export const createGameRoom = (gameName, firstUserId, secondUserId) => {
    return gameApi.post("/game", {
        gameName,
        firstUserId,
        secondUserId,
    });
};

export const getGameRoom = (roomId) => {
    return gameApi.get(`/game/${roomId}`);
};

export const getUserGames = (userId) => {
    return gameApi.get(`/game/userGames/${userId}`);
};

export const getGameInvitations = (userId) => {
    return gameApi.get(`/game/invitations/${userId}`);
};

export const acceptGameInvitation = (roomId, userId) => {
    return gameApi.post(`/game/${roomId}/accept`, {
        userId,
    });
};

export const leaveGame = (roomId, userId) => {
    return gameApi.post(`/game/${roomId}/leave`, {
        userId,
    });
};
