const app = require("./app");
require("dotenv").config();
const PORT = process.env.PORT || 3000;

const sequelize = require("./config/database");


async function startServer() {
    try{
        await sequelize.sync();

        app.listen(PORT, () => {
            console.log(`Chat service running on port ${PORT}`);
        });
    }
    catch (error) {
        console.log(error);
    }
};

startServer();
