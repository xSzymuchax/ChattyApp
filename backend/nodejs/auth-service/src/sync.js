require("dotenv").config();
const { sequelize } = require("./models");

sequelize.sync({ alter: true })
    .then(() => {
        console.log("schema sync finished");
        return sequelize.close();
    })
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
