const http = require('http');
const path = require('path');
const express = require('express');
const swaggerUI = require('swagger-ui-express');

const createWebSocketServer = require('./websocket/webSocketServer');
const { sendToUser } = require('./websocket/connectionManager');
const swaggerDoc = require('./config/swagger');

const app = express();

app.use(express.json());
app.use('/swagger', swaggerUI.serve, swaggerUI.setup(swaggerDoc));
app.get('/asyncapi', (req, res) => {
    res.type('yaml');
    res.sendFile(path.join(__dirname, 'docs/asyncapi.yaml'));
});

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
