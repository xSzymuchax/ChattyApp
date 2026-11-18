const app = require("./app");
require("dotenv").config();
const { connectRedis } = require("./middleware/rateLimit");
const gameRepository = require("./modules/game/game.repository");
const PORT = process.env.PORT || 3000;

async function start() {
    await connectRedis();
    await gameRepository.connectGames();

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Game service running on port ${PORT}`);
    });
}

start();
