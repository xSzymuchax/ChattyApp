const http = require('http');
const express = require('express');

const createWebSocketServer = require('./websocket/webSocketServer');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({
        content: 'Service running.'
    });
});

const server = http.createServer(app);

createWebSocketServer(server);

module.exports = {
    server
};