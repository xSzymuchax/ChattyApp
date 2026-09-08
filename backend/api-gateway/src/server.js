const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();

function corsOrigin(origin, callback) {
    if (!origin) {
        callback(null, true);
        return;
    }

    const extra = (process.env.FRONTEND_ORIGIN || '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);

    if (extra.includes(origin)) {
        callback(null, true);
        return;
    }

    try {
        const { hostname } = new URL(origin);

        if (
            hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname.endsWith('.ngrok-free.dev') ||
            hostname.endsWith('.ngrok-free.app') ||
            hostname.endsWith('.ngrok.app') ||
            hostname.endsWith('.ngrok.io')
        ) {
            callback(null, true);
            return;
        }
    } catch {
        callback(null, false);
        return;
    }

    callback(null, false);
}

const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: corsOrigin,
}));

app.use(
    '/auth',
    createProxyMiddleware({
        target: process.env.AUTH_SERVICE_URL,
        changeOrigin: true
    })
);

app.use(
    '/user',
    createProxyMiddleware({
        target: process.env.USER_SERVICE_URL,
        changeOrigin: true
    })
);

app.use(
    '/chat',
    createProxyMiddleware({
        target: process.env.CHAT_SERVICE_URL,
        changeOrigin: true
    })
);

app.use(
    '/game',
    createProxyMiddleware({
        target: process.env.GAME_SERVICE_URL,
        changeOrigin: true
    })
);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`API Gateway running on port ${PORT}`);
});