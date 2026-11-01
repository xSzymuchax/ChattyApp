const { Sequelize } = require("sequelize");

const useSsl = process.env.DATABASE_SSL === "true";

const sequelize = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.DATABASE_USER,
    process.env.DATABASE_PASSWORD,
    {
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT,
        dialect: "postgres",
        logging: false,
        dialectOptions: useSsl
            ? { ssl: { require: true, rejectUnauthorized: false } }
            : {},
    }
);

module.exports = sequelize;