const decodeUserId = require('../util/jwtDecode');
const {
    addConnection
} = require('../websocket/connectionManager');

function handleAuth(ws, data) {
    const userId = decodeUserId(data.token);

    if (!userId) {
        ws.close();
        return;
    }

    ws.userId = userId;

    addConnection(userId, ws);

    console.log(`User ${userId} authenticated`);
}

module.exports = handleAuth;