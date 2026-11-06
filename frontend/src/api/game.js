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

export const getUserGames = () => {
    return gameApi.get("/game");
};

export const getGameInvitations = () => {
    return gameApi.get("/game/invitations");
};

export const acceptGameInvitation = (roomId) => {
    return gameApi.patch(`/game/${roomId}`, {
        status: "active",
    });
};

export const leaveGame = (roomId) => {
    return gameApi.delete(`/game/${roomId}`);
};
