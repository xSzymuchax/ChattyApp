const { createClient } = require("redis");

const state = { client: null };

async function connectRedis() {
    if (!process.env.REDIS_URL)
        return;

    const redis = createClient({ url: process.env.REDIS_URL });
    redis.on("error", (error) => console.log(error));

    try {
        await redis.connect();
        state.client = redis;
    } catch (error) {
        console.log(error);
    }
}

function userId(req) {
    const id = Number(req.user?.userId);
    return Number.isInteger(id) && id > 0 ? String(id) : null;
}

function rateLimit({ action, limit, windowSeconds, identity }) {
    return async function limitAction(req, res, next) {
        const redis = state.client;
        const id = identity(req);

        if (!redis?.isOpen || !id) {
            next();
            return;
        }

        try {
            const key = `rl:${action}:${id}`;
            const count = await redis.incr(key);
            await redis.expire(key, windowSeconds, "NX");

            if (count > limit) {
                res.status(429).json({ message: "Too many attempts." });
                return;
            }

            next();
        } catch (error) {
            console.log(error);
            next();
        }
    };
}

module.exports = {
    connectRedis,
    rateLimit,
    userId,
};
