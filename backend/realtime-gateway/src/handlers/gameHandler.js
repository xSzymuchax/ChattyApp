const axios = require('axios');
const { sendToUser, sendOn, notifyRoomPlayers } = require('../websocket/connectionManager');

const gameServiceUrl = () => process.env.GAME_SERVICE_URL;

const sendGameError = (userId, message) => {
    sendToUser(userId, { message }, 'gameError');
};

async function handleGameCreate(ws, data) {
    try {
        if (!ws.userId) {
            ws.close();
            return;
        }

        const response = await axios.post(`${gameServiceUrl()}/`, {
            gameName: data.gameName,
            firstUserId: ws.userId,
            secondUserId: data.secondUserId,
        });

        const room = response.data;
        sendOn(ws, 'gameUpdate', room);
        sendToUser(room.secondUserId, room, 'gameInvite');
    } catch (error) {
        console.log(error.response?.data || error.message);
        sendGameError(
            ws.userId,
            error.response?.data?.message || 'Could not create game.'
        );
    }
}

async function handleGameAccept(ws, data) {
    try {
        if (!ws.userId) {
            ws.close();
            return;
        }

        const response = await axios.post(
            `${gameServiceUrl()}/${data.roomId}/accept`,
            { userId: ws.userId }
        );

        notifyRoomPlayers(ws, response.data, 'gameUpdate', response.data);
    } catch (error) {
        console.log(error.response?.data || error.message);
        sendGameError(
            ws.userId,
            error.response?.data?.message || 'Could not accept invitation.'
        );
    }
}

async function handleGameLeave(ws, data) {
    try {
        if (!ws.userId) {
            ws.close();
            return;
        }

        if (!data.roomId) {
            sendToUser(ws.userId, { roomId: data.roomId }, 'gameEnded');
            return;
        }

        const response = await axios.post(
            `${gameServiceUrl()}/${data.roomId}/leave`,
            { userId: ws.userId }
        );

        notifyRoomPlayers(ws, response.data, 'gameEnded', { roomId: response.data.id });
    } catch (error) {
        console.log(error.response?.data || error.message);

        if (error.response?.status === 404) {
            sendToUser(ws.userId, { roomId: data.roomId }, 'gameEnded');
            return;
        }

        sendGameError(
            ws.userId,
            error.response?.data?.message || 'Could not leave game.'
        );
    }
}

async function handleGameMove(ws, data) {
    try {
        if (!ws.userId) {
            ws.close();
            return;
        }

        const response = await axios.post(
            `${gameServiceUrl()}/${data.roomId}/move`,
            {
                userId: ws.userId,
                move: data.move,
            }
        );

        notifyRoomPlayers(ws, response.data, 'gameUpdate', response.data);
    } catch (error) {
        console.log(error.response?.data || error.message);
        sendGameError(
            ws.userId,
            error.response?.data?.message || 'Illegal move.'
        );
    }
}

module.exports = {
    handleGameCreate,
    handleGameAccept,
    handleGameLeave,
    handleGameMove,
};
