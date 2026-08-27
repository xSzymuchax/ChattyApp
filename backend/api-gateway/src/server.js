const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();

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

app.listen(3000, () => {
    console.log('API Gateway running on port 3000');
});