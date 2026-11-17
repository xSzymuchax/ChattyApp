const app = require("./app");
require("dotenv").config();
const { connectRedis } = require("./middleware/rateLimit");
const { connectProfileCache } = require("./util/profileCache");
const PORT = process.env.PORT || 3000;

async function start() {
    await connectRedis();
    await connectProfileCache();

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`User service running on port ${PORT}`);
    });
}

start();
