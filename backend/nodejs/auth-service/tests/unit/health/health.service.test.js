const healthService = require("../../../src/modules/health/health.service");

describe("HealthService", () => {
    describe("getHealth", () => {
        it("should return service status", () => {
            const result = healthService.getHealth();
            expect(result).toEqual({content: "Service running."});
        });
    });
});