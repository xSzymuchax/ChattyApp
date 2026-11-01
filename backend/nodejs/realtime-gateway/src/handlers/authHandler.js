const decodeUserId = require('../util/jwtDecode');
const {
    addConnection
} = require('../websocket/connectionManager');

function handleAuth(ws, data) {
    const userId = decodeUserId(data.token);

    if (!userId) {
        ws.close(4001, "Unauthorized");
        return;
    }

    ws.token = data.token;
    addConnection(userId, ws);

    console.log(`User ${userId} authenticated`);
}

module.exports = handleAuth;