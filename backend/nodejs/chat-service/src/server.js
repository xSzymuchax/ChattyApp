const app = require("./app");
require("dotenv").config();
const { connectRedis } = require("./middleware/rateLimit");
const { connectRealtime } = require("./realtime/publish");
const PORT = process.env.PORT || 3000;

async function start() {
    await connectRedis();
    await connectRealtime();

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Chat service running on port ${PORT}`);
    });
}

start();
