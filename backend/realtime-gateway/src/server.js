const {wss_server} = require("./app");

require("dotenv").config();
const PORT = process.env.PORT || 3300;

async function startServer() {
    try {
        wss_server.listen(PORT, () => {
            console.log(`Realtime gateway running on port ${PORT}`);
        });
    } catch (error) {
        console.log(error);
    }
};

startServer();