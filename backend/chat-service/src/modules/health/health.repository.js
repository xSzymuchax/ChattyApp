const createHealthRepository = (Health) => ({
    async findById(id) {
        return Health.findByPk(id);
    },

    async findAll() {
        return Health.findAll();
    },

    async create(data) {
        return Health.create(data);
    },

    async update(id, data) {
        const health = await Health.findByPk(id);

        if (!health) {
            return null;
        }

        await health.update(data);

        return health;
    },

    async delete(id) {
        const health = await Health.findByPk(id);

        if (!health) {
            return false;
        }

        await health.destroy();

        return true;
    },
});

module.exports = createHealthRepository;