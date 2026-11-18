const { createClient } = require("redis");

const TTL_SECONDS = 300;
const state = { client: null };

const keyFor = (id) => `user:${Number(id)}`;

const cache = () => (state.client?.isOpen ? state.client : null);

async function connectProfileCache() {
    if (!process.env.REDIS_URL)
        return;

    const client = createClient({ url: process.env.REDIS_URL });
    client.on("error", (error) => console.log(error));

    try {
        await client.connect();
        state.client = client;
    } catch (error) {
        console.log(error);
    }
}

async function readProfile(id) {
    const client = cache();

    if (!client)
        return null;

    try {
        const raw = await client.get(keyFor(id));

        if (!raw)
            return null;

        const profile = JSON.parse(raw);
        return profile?.id ? profile : null;
    } catch (error) {
        console.log(error);
        return null;
    }
}

async function saveProfile(user) {
    const client = cache();

    if (!client || !user?.id)
        return;

    try {
        await client.set(keyFor(user.id), JSON.stringify(user), { EX: TTL_SECONDS });
    } catch (error) {
        console.log(error);
    }
}

async function dropProfile(id) {
    const client = cache();

    if (!client)
        return;

    try {
        await client.del(keyFor(id));
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    connectProfileCache,
    readProfile,
    saveProfile,
    dropProfile,
};
