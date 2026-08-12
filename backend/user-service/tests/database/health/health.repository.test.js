const { PostgreSqlContainer } = require("@testcontainers/postgresql");
const { Sequelize } = require("sequelize");

const Health = require(
    "../../../src/modules/health/models/health.model"
);

const createHealthRepository = require(
    "../../../src/modules/health/health.repository"
);

describe("HealthRepository", () => {
    let container;
    let sequelize;
    let HealthModel;
    let healthRepository;

    beforeAll(async () => {
        container = await new PostgreSqlContainer("postgres:17")
            .start();

        sequelize = new Sequelize({
            dialect: "postgres",
            host: container.getHost(),
            port: container.getPort(),
            database: container.getDatabase(),
            username: container.getUsername(),
            password: container.getPassword(),
            logging: false,
        });

        HealthModel = Health(sequelize);

        healthRepository = createHealthRepository(HealthModel);

        await sequelize.authenticate();
        await sequelize.sync();
    }, 60000);

    afterAll(async () => {
        await sequelize.close();
        await container.stop();
    });

    it("should create and find health record", async () => {
        const created = await healthRepository.create({
            status: "healthy",
        });

        expect(created.id).toBeDefined();
        expect(created.status).toBe("healthy");

        const found = await healthRepository.findById(created.id);

        expect(found).not.toBeNull();
        expect(found.status).toBe("healthy");
    });
});