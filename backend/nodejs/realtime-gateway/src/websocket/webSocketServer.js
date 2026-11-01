const WebSocket = require('ws');
const handleConnection = require('./connectionHandler');

function createWebSocketServer(server) {
    const wss = new WebSocket.Server({
        server
    });

    wss.on('connection', handleConnection);

    return wss;
}

module.exports = createWebSocketServer;