const express = require("express");
const swaggerUI = require("swagger-ui-express");

const cors = require("cors");

const swaggerDoc = require("./config/swagger");
const healthRoutes = require("./modules/health/health.routes");
const authRoutes = require("./modules/auth/auth.routes");

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

app.use(cors({
    origin: corsOrigin,
}));

app.use(express.json());
app.use("/health", healthRoutes);
app.use("/swagger", swaggerUI.serve, swaggerUI.setup(swaggerDoc));
app.use("/", authRoutes);

module.exports = app;