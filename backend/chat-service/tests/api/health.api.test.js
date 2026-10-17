const request = require("supertest");

const app = require("../../src/app");
const { HealthResponseDto } = require("../../src/modules/health/dto/health-response.dto");

describe("GET /health", () => {
    it("returns the documented health payload", async () => {
        const response = await request(app).get("/health");

        expect(response.status).toBe(200);
        expect(HealthResponseDto.strict().safeParse(response.body).success).toBe(true);
        expect(response.body).toEqual({ content: "Service running." });
    });
});
