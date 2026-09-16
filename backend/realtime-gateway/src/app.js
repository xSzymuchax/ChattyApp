const http = require('http');
const express = require('express');

const createWebSocketServer = require('./websocket/webSocketServer');
const { sendToUser } = require('./websocket/connectionManager');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({
        content: 'Service running.'
    });
});

app.post('/notify', (req, res) => {
    const { userId, type, message } = req.body;
    sendToUser(userId, message, type);
    res.status(204).end();
});

const server = http.createServer(app);

createWebSocketServer(server);

module.exports = {
    server
};
