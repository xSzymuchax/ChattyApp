const { Health } = require("../../models");
const createHealthRepository = require("./health.repository");

const healthRepository = createHealthRepository(Health);

const healthService = {
    getHealth() {
        return {
            content: "Service running.",
        };
    },

    async createHealth(data) {
        return healthRepository.create(data);
    },

    async getHealthById(id) {
        return healthRepository.findById(id);
    },

    async getAllHealth() {
        return healthRepository.findAll();
    },

    async updateHealth(id, data) {
        return healthRepository.update(id, data);
    },

    async deleteHealth(id) {
        return healthRepository.delete(id);
    },
};

module.exports = healthService;