const { createClient } = require("redis");

const CHANNEL = "rt:fanout";
const state = { client: null };

async function connectRealtime() {
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

// KUBERNETES
function publishRealtime(frame) {
    const redis = state.client;

    if (!redis?.isOpen)
        return false;

    redis.publish(CHANNEL, JSON.stringify(frame)).catch((error) => console.log(error));
    return true;
}

module.exports = {
    connectRealtime,
    publishRealtime,
};
