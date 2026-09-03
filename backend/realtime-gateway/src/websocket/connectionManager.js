const connections = new Map();

function addConnection(userId, ws) {
    connections.set(userId, ws);
    // console.log(connections);
}

function removeConnection(userId, ws) {
    if (connections.get(userId) === ws) {
        connections.delete(userId);
    }
}

function getConnection(userId) {
    return connections.get(userId);
}

function sendToUser(userId, message, messageType) {
    console.log(userId, message, messageType);
    const ws = connections.get(userId);

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

    console.log("POSZLO");
    return true;
}

module.exports = {
    addConnection,
    removeConnection,
    getConnection,
    sendToUser
};