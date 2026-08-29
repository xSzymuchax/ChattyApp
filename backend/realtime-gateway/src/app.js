const http = require('http');
const WebSocket = require('ws');
const express = require("express");
const decodeUserId = require('./util/jwtDecode');

const app = express();

app.use(express.json());
app.use("/health", (req, res) => {
    res.json({content: "Service running."});
});


const wss_server = http.createServer(app);

const wss = new WebSocket.Server({
    server: wss_server
});

const connections = new Map();

wss.on('connection', (ws) => {
    console.log("New Connection!");

    const authTimeout = setTimeout(() => {
        if (!ws.userId) {
            console.log("Closing WS - not authenticated");
            ws.close();
        }
    }, 5000);

    ws.on('message', (message) => {
        try {
            console.log('Received:', message.toString());

            const data = JSON.parse(message);
            if (data.type === 'auth') {
                const userId = decodeUserId(data.token);

                if (!userId){
                    ws.close();
                    return;
                } 

                ws.userId = userId;
                connections.set(userId, ws);
            }
        } catch (error) {
            console.log(error);
            ws.close();
        }
        
    });

    ws.on('close', () => {
        console.log('WS disconnected');

        if (ws.userId){
            if (connections.get(ws.userId) === ws) {
                connections.delete(ws.userId);
            }
        }
    });
});

module.exports = { wss_server };

