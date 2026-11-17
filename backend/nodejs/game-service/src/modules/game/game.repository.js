const { createClient } = require("redis");

const rooms = new Map();
let redis = null;

const roomKey = (id) => `game:room:${id}`;
const userKey = (userId) => `game:user:${Number(userId)}`;

const usesRedis = () => Boolean(redis?.isOpen);

async function connectGames() {
    if (!process.env.REDIS_URL)
        return;

    const client = createClient({ url: process.env.REDIS_URL });
    client.on("error", (error) => console.log(error));

    try {
        await client.connect();
        redis = client;
    } catch (error) {
        console.log(error);
    }
}

const rememberPlayers = (multi, room) => {
    multi.sAdd(userKey(room.firstUserId), room.id);
    multi.sAdd(userKey(room.secondUserId), room.id);
};

const gameRepository = {
    connectGames,

    async create(room) {
        // RENDER
        if (!usesRedis()) {
            rooms.set(room.id, room);
            return room;
        }

        // KUBERNETES
        const multi = redis.multi();
        multi.set(roomKey(room.id), JSON.stringify(room));
        rememberPlayers(multi, room);
        await multi.exec();
        return room;
    },

    async findById(id) {
        // RENDER
        if (!usesRedis())
            return rooms.get(id) ?? null;

        // KUBERNETES
        const raw = await redis.get(roomKey(id));
        return raw ? JSON.parse(raw) : null;
    },

    async findByUserId(userId) {
        // RENDER
        if (!usesRedis()) {
            return [...rooms.values()].filter(
                (room) => room.firstUserId === userId || room.secondUserId === userId
            );
        }

        // KUBERNETES
        const ids = await redis.sMembers(userKey(userId));
        const found = [];

        for (const id of ids) {
            const room = await this.findById(id);

            if (room)
                found.push(room);
            else
                await redis.sRem(userKey(userId), id);
        }

        return found;
    },

    async save(room) {
        // RENDER
        if (!usesRedis()) {
            rooms.set(room.id, room);
            return room;
        }

        // KUBERNETES
        await redis.set(roomKey(room.id), JSON.stringify(room));
        return room;
    },

    async delete(id) {
        // RENDER
        if (!usesRedis())
            return rooms.delete(id);

        // KUBERNETES
        const room = await this.findById(id);

        if (!room)
            return false;

        const multi = redis.multi();
        multi.del(roomKey(id));
        multi.sRem(userKey(room.firstUserId), id);
        multi.sRem(userKey(room.secondUserId), id);
        await multi.exec();
        return true;
    },
};

module.exports = gameRepository;
