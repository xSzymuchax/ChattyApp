const rooms = new Map();

const gameRepository = {
    create(room) {
        rooms.set(room.id, room);
        return room;
    },

    findById(id) {
        return rooms.get(id) ?? null;
    },

    findByUserId(userId) {
        return [...rooms.values()].filter(
            (room) => room.firstUserId === userId || room.secondUserId === userId
        );
    },

    save(room) {
        rooms.set(room.id, room);
        return room;
    },

    delete(id) {
        return rooms.delete(id);
    },
};

module.exports = gameRepository;
