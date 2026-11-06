const axios = require('axios');
const { sendToUser, sendOn, notifyRoomPlayers } = require('../websocket/connectionManager');

const gameServiceUrl = () => process.env.GAME_SERVICE_URL;

const authHeaders = (ws) => (
    ws.token ? { Authorization: `Bearer ${ws.token}` } : {}
);

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
        }, { headers: authHeaders(ws) });

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

        const response = await axios.patch(
            `${gameServiceUrl()}/${data.roomId}`,
            { status: "active" },
            { headers: authHeaders(ws) }
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

        const response = await axios.delete(
            `${gameServiceUrl()}/${data.roomId}`,
            { headers: authHeaders(ws) }
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
            `${gameServiceUrl()}/${data.roomId}/moves`,
            { move: data.move },
            { headers: authHeaders(ws) }
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
