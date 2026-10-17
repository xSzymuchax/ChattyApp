const gameService = require("../../../src/modules/game/game.service");

describe("GameService", () => {
    const createdIds = [];

    const openRoom = (firstUserId, secondUserId, gameName = "Checkers") => {
        const result = gameService.createGameRoom({ gameName, firstUserId, secondUserId });
        if (result.room) createdIds.push(result.room.id);
        return result;
    };

    afterEach(() => {
        for (const id of createdIds) {
            const room = gameService.getGameRoom(id);
            if (room) gameService.leaveGame(id, room.firstUserId);
        }
        createdIds.length = 0;
    });

    it("rejects an unknown game and a busy player", () => {
        expect(gameService.createGameRoom({
            gameName: "Chess",
            firstUserId: 1,
            secondUserId: 2,
        })).toEqual({ error: "bad_request" });

        const created = openRoom(1, 2);
        expect(created.room.status).toBe("pending");

        expect(openRoom(1, 3)).toEqual({ error: "busy" });
    });

    it("lists a pending room only as an invitation for the second player", () => {
        const { room } = openRoom(1, 2, "Abalone");

        expect(gameService.getInvitations(2).map((item) => item.id)).toEqual([room.id]);
        expect(gameService.getInvitations(1)).toEqual([]);
        expect(gameService.getUserGames(1)).toHaveLength(1);
        expect(gameService.getGameRoom("missing")).toBeNull();
    });

    it("accepts only the invited player and then applies a legal move", () => {
        const { room } = openRoom(1, 2);
        const move = room.gameState.legalMoves[0];

        expect(gameService.acceptInvitation(room.id, 1)).toEqual({ error: "forbidden" });
        expect(gameService.makeMove(room.id, { userId: 1, move })).toEqual({ error: "forbidden" });

        const accepted = gameService.acceptInvitation(room.id, 2);
        expect(accepted.room.status).toBe("active");

        const played = gameService.makeMove(room.id, {
            userId: 1,
            move: { from: move.from, to: move.to },
        });

        expect(played.room.moves).toEqual([{ userId: 1, move: { from: move.from, to: move.to } }]);
        expect(played.room.gameState.turn).toBe("red");
    });

    it("removes a room when a participant leaves and hides it afterwards", () => {
        const { room } = openRoom(4, 5);

        expect(gameService.leaveGame(room.id, 9)).toEqual({ error: "forbidden" });
        expect(gameService.leaveGame("missing", 4)).toEqual({ error: "not_found" });

        const left = gameService.leaveGame(room.id, 5);
        expect(left.room.id).toBe(room.id);
        expect(gameService.getGameRoom(room.id)).toBeNull();
        expect(gameService.getUserGames(4)).toEqual([]);
    });
});
