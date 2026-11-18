const { createClient } = require("redis");

const TTL_SECONDS = 300;
const state = { client: null };

const keyFor = (id) => `chat:members:${Number(id)}`;

const cache = () => (state.client?.isOpen ? state.client : null);

async function connectMembershipCache() {
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

async function readMembership(id) {
    const client = cache();

    if (!client)
        return null;

    try {
        const raw = await client.get(keyFor(id));

        if (!raw)
            return null;

        const membership = JSON.parse(raw);

        if (!Array.isArray(membership?.memberIds) || typeof membership.active !== "boolean")
            return null;

        return membership;
    } catch (error) {
        console.log(error);
        return null;
    }
}

async function saveMembership(id, membership) {
    const client = cache();

    if (!client || !Number(id))
        return;

    try {
        await client.set(keyFor(id), JSON.stringify({
            memberIds: membership.memberIds,
            active: membership.active,
        }), { EX: TTL_SECONDS });
    } catch (error) {
        console.log(error);
    }
}

async function dropMembership(id) {
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
    connectMembershipCache,
    readMembership,
    saveMembership,
    dropMembership,
};
