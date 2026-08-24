const express = require("express");
const swaggerUI = require("swagger-ui-express");

const swaggerDoc = require("./config/swagger");
const healthRoutes = require("./modules/health/health.routes");
const chatRoutes = require("./modules/chat/chat.routes");

const app = express();

app.use(express.json());
app.use("/health", healthRoutes);
app.use("/swagger", swaggerUI.serve, swaggerUI.setup(swaggerDoc));
app.use("/chat", chatRoutes);

module.exports = app;
