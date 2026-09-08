const connections = new Map();

function toUserId(userId) {
    const id = Number(userId);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function addConnection(userId, ws) {
    const id = toUserId(userId);

    if (!id)
        return;

    ws.userId = id;
    connections.set(id, ws);
}

function removeConnection(userId, ws) {
    const id = toUserId(userId);

    if (!id)
        return;

    if (connections.get(id) === ws) {
        connections.delete(id);
    }
}

function getConnection(userId) {
    const id = toUserId(userId);
    return id ? connections.get(id) : undefined;
}

function sendToUser(userId, message, messageType) {
    console.log(userId, messageType);
    const ws = getConnection(userId);

    if (!ws) {
        console.log("NIE MA");
        return false;
    }

    if (ws.readyState !== ws.OPEN) {
        console.log("NIE GOTOWE");
        return false;
    }

    ws.send(JSON.stringify({
        type: messageType,
        message: message
    }));

    console.log("POSZLO", messageType, userId);
    return true;
}

function sendOn(ws, messageType, message) {
    if (!ws || ws.readyState !== ws.OPEN)
        return false;

    ws.send(JSON.stringify({
        type: messageType,
        message: message
    }));

    return true;
}

function notifyRoomPlayers(ws, room, messageType, payload) {
    sendOn(ws, messageType, payload);

    const otherUserId =
        toUserId(ws.userId) === toUserId(room.firstUserId)
            ? room.secondUserId
            : room.firstUserId;

    sendToUser(otherUserId, payload, messageType);
}

module.exports = {
    addConnection,
    removeConnection,
    getConnection,
    sendToUser,
    sendOn,
    notifyRoomPlayers
};
