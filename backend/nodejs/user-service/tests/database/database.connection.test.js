const { PostgreSqlContainer } = require("@testcontainers/postgresql");
const {Sequelize } = require("sequelize");

describe("PostgeSQL connection", () => {
    let container;
    let sequelize;

    beforeAll(async () => {
        container = await new PostgreSqlContainer("postgres:17").start();

        sequelize = new Sequelize({
            dialect: "postgres",
            host: container.getHost(),
            port: container.getPort(),
            database: container.getDatabase(),
            username: container.getUsername(),
            password: container.getPassword(),
            logging: false,
        });

        await sequelize.authenticate();
    }, 60000);

    afterAll(async () => {
        await sequelize.close();
        await container.stop();
    });

    it("should connect to PostgreSQL", async () => {
        await expect(sequelize.authenticate()).resolves.not.toThrow();
    });
});