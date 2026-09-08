const request = require("supertest");
const app = require("../../../src/app");
const { HealthResponseDto } = require("../../../src/modules/health/dto/health-response.dto");

describe("GET /health", () => {
    it("should return 200 and health status", async () => {
        const response = await request(app).get("/health");
        expect(response.status).toBe(200);

        const parseResult = HealthResponseDto.safeParse(response.body);
        expect(parseResult.success).toBe(true);
        expect(parseResult.data.content).toBe("Service running.");
    });
});
