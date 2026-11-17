const express = require("express");
const swaggerUI = require("swagger-ui-express");

const swaggerDoc = require("./config/swagger");
const healthRoutes = require("./modules/health/health.routes");
const userRoutes = require("./modules/user/user.routes");

const app = express();

app.set("trust proxy", 1);

app.use(express.json());
app.use("/health", healthRoutes);
app.use("/swagger", swaggerUI.serve, swaggerUI.setup(swaggerDoc));
app.use("/", userRoutes);

module.exports = app;