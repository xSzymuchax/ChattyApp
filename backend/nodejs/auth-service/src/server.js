const app = require("./app");
require("dotenv").config();
const { connectRedis } = require("./middleware/rateLimit");
const PORT = process.env.PORT || 3001;

async function start() {
    await connectRedis();

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Auth service running on port ${PORT}`);
    });
}

start();
