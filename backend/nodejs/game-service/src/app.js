const express = require("express");
const swaggerUI = require("swagger-ui-express");

const swaggerDoc = require("./config/swagger");
const healthRoutes = require("./modules/health/health.routes");
const gameRoutes = require("./modules/game/game.routes");

const app = express();

app.use(express.json());

app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
        return res.status(400).json({ message: "Bad request." });
    }

    next(error);
});

app.use("/health", healthRoutes);
app.use("/swagger", swaggerUI.serve, swaggerUI.setup(swaggerDoc));
app.use("/", gameRoutes);

module.exports = app;
