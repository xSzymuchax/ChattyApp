const gameService = require("../../../src/modules/game/game.service");

describe("GameService", () => {
    const createdIds = [];

    const openRoom = async (firstUserId, secondUserId, gameName = "Checkers") => {
        const result = await gameService.createGameRoom({ gameName, firstUserId, secondUserId });
        if (result.room) createdIds.push(result.room.id);
        return result;
    };

    afterEach(async () => {
        for (const id of createdIds) {
            const room = await gameService.getGameRoom(id);
            if (room) await gameService.leaveGame(id, room.firstUserId);
        }
        createdIds.length = 0;
    });

    it("rejects an unknown game and a busy player", async () => {
        expect(await gameService.createGameRoom({
            gameName: "Chess",
            firstUserId: 1,
            secondUserId: 2,
        })).toEqual({ error: "bad_request" });

        const created = await openRoom(1, 2);
        expect(created.room.status).toBe("pending");

        expect(await openRoom(1, 3)).toEqual({ error: "busy" });
    });

    it("lists a pending room only as an invitation for the second player", async () => {
        const { room } = await openRoom(1, 2, "Abalone");

        expect((await gameService.getInvitations(2)).map((item) => item.id)).toEqual([room.id]);
        expect(await gameService.getInvitations(1)).toEqual([]);
        expect(await gameService.getUserGames(1)).toHaveLength(1);
        expect(await gameService.getGameRoom("missing")).toBeNull();
    });

    it("accepts only the invited player and then applies a legal move", async () => {
        const { room } = await openRoom(1, 2);
        const move = room.gameState.legalMoves[0];

        expect(await gameService.acceptInvitation(room.id, 1)).toEqual({ error: "forbidden" });
        expect(await gameService.makeMove(room.id, { userId: 1, move })).toEqual({ error: "forbidden" });

        const accepted = await gameService.acceptInvitation(room.id, 2);
        expect(accepted.room.status).toBe("active");

        const played = await gameService.makeMove(room.id, {
            userId: 1,
            move: { from: move.from, to: move.to },
        });

        expect(played.room.moves).toEqual([{ userId: 1, move: { from: move.from, to: move.to } }]);
        expect(played.room.gameState.turn).toBe("red");
    });

    it("removes a room when a participant leaves and hides it afterwards", async () => {
        const { room } = await openRoom(4, 5);

        expect(await gameService.leaveGame(room.id, 9)).toEqual({ error: "forbidden" });
        expect(await gameService.leaveGame("missing", 4)).toEqual({ error: "not_found" });

        const left = await gameService.leaveGame(room.id, 5);
        expect(left.room.id).toBe(room.id);
        expect(await gameService.getGameRoom(room.id)).toBeNull();
        expect(await gameService.getUserGames(4)).toEqual([]);
    });
});
