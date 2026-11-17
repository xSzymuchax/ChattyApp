const app = require("./app");
require("dotenv").config();
const { connectRedis } = require("./middleware/rateLimit");
const { connectRealtime } = require("./realtime/publish");
const { connectMembershipCache } = require("./util/membershipCache");
const PORT = process.env.PORT || 3000;

async function start() {
    await connectRedis();
    await connectRealtime();
    await connectMembershipCache();

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Chat service running on port ${PORT}`);
    });
}

start();
