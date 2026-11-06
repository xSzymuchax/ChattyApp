jest.mock("../../src/modules/game/game.service", () => ({
    allowedGameNames: ["Checkers", "Abalone"],
    createGameRoom: jest.fn(),
    getGameRoom: jest.fn(),
    getUserGames: jest.fn(),
    getInvitations: jest.fn(),
    acceptInvitation: jest.fn(),
    leaveGame: jest.fn(),
    makeMove: jest.fn(),
}));

process.env.JWT_SECRET = "game-api-secret";

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../../src/app");

const tokenFor = (userId) =>
    jwt.sign({ userId, username: "player" }, process.env.JWT_SECRET);

const asUser = (userId, req) =>
    req.set("Authorization", `Bearer ${tokenFor(userId)}`);
const gameService = require("../../src/modules/game/game.service");

const room = {
    id: "room-1",
    gameName: "Checkers",
    firstUserId: 1,
    secondUserId: 2,
    status: "pending",
    gameState: { board: [] },
    moves: [],
};

const resetMocks = () => {
    for (const value of Object.values(gameService)) {
        if (jest.isMockFunction(value))
            value.mockReset();
    }
};

describe("Game API", () => {
    beforeEach(() => {
        jest.spyOn(console, "log").mockImplementation(() => {});
        resetMocks();
    });

    afterEach(() => {
        console.log.mockRestore();
    });

    describe("POST /", () => {
        it.each(["Checkers", "Abalone"])("creates a %s room", async (gameName) => {
            gameService.createGameRoom.mockReturnValue({ room: { ...room, gameName } });

            const response = await asUser(1, request(app).post("/")).send({
                gameName,
                firstUserId: 1,
                secondUserId: 2,
            });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ ...room, gameName });
            expect(gameService.createGameRoom).toHaveBeenCalledWith({
                gameName,
                firstUserId: 1,
                secondUserId: 2,
            });
        });

        it.each([
            [{}, "the body is empty"],
            [{ gameName: "Checkers", firstUserId: 1 }, "the second user is missing"],
            [{ gameName: "Checkers", secondUserId: 2 }, "the first user is missing"],
            [{ gameName: "Checkers", firstUserId: "1", secondUserId: 2 }, "a user id is a string"],
            [{ gameName: "Checkers", firstUserId: 1.5, secondUserId: 2 }, "a user id is fractional"],
            [{ gameName: "Checkers", firstUserId: "abc", secondUserId: 2 }, "a user id is not numeric"],
            [{ gameName: "checkers", firstUserId: 1, secondUserId: 2 }, "the game name has the wrong case"],
            [{ gameName: "Chess", firstUserId: 1, secondUserId: 2 }, "the game name is unknown"],
            [{ gameName: "", firstUserId: 1, secondUserId: 2 }, "the game name is empty"],
            [{ firstUserId: 1, secondUserId: 2 }, "the game name is missing"],
        ])("returns 400 when %j (%s)", async (body) => {
            gameService.createGameRoom.mockReturnValue({ room });

            const response = await asUser(1, request(app).post("/")).send(body);

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: "Bad request." });
            expect(gameService.createGameRoom).not.toHaveBeenCalled();
        });

        it("returns 409 when a player is already in a game", async () => {
            gameService.createGameRoom.mockReturnValue({ error: "busy" });

            const response = await asUser(1, request(app).post("/")).send({
                gameName: "Checkers",
                firstUserId: 1,
                secondUserId: 2,
            });

            expect(response.status).toBe(409);
            expect(response.body).toEqual({ message: "User is already in a game." });
        });

        it("returns 400 for malformed JSON", async () => {
            const response = await request(app)
                .post("/")
                .set("Content-Type", "application/json")
                .send("{");

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: "Bad request." });
            expect(gameService.createGameRoom).not.toHaveBeenCalled();
        });

        it("rejects a JSON null body", async () => {
            const response = await request(app)
                .post("/")
                .set("Content-Type", "application/json")
                .send("null");

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: "Bad request." });
            expect(gameService.createGameRoom).not.toHaveBeenCalled();
        });

        it("returns 500 without leaking the internal error", async () => {
            gameService.createGameRoom.mockImplementation(() => {
                throw new Error("state leaked");
            });

            const response = await asUser(1, request(app).post("/")).send({
                gameName: "Checkers",
                firstUserId: 1,
                secondUserId: 2,
            });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Internal server error." });
            expect(JSON.stringify(response.body)).not.toContain("leaked");
        });
    });

    describe("GET /:id", () => {
        it("returns the room", async () => {
            gameService.getGameRoom.mockReturnValue(room);

            const response = await asUser(1, request(app).get("/room-1"));

            expect(response.status).toBe(200);
            expect(response.body).toEqual(room);
            expect(gameService.getGameRoom).toHaveBeenCalledWith("room-1");
        });

        it("returns 404 when the room does not exist", async () => {
            gameService.getGameRoom.mockReturnValue(null);

            const response = await asUser(1, request(app).get("/missing"));

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: "Game room not found." });
        });

        it("returns 500 without leaking the internal error", async () => {
            gameService.getGameRoom.mockImplementation(() => {
                throw new Error("lookup leaked");
            });

            const response = await asUser(1, request(app).get("/room-1"));

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Internal server error." });
            expect(JSON.stringify(response.body)).not.toContain("leaked");
        });
    });

    describe("GET /", () => {
        it("returns the user's games", async () => {
            gameService.getUserGames.mockReturnValue([room]);

            const response = await asUser(4, request(app).get("/"));

            expect(response.status).toBe(200);
            expect(response.body).toEqual([room]);
            expect(gameService.getUserGames).toHaveBeenCalledWith(4);
        });

        it("returns an empty list", async () => {
            gameService.getUserGames.mockReturnValue([]);

            const response = await asUser(4, request(app).get("/"));

            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        it("returns 500 without leaking the internal error", async () => {
            gameService.getUserGames.mockImplementation(() => {
                throw new Error("list leaked");
            });

            const response = await asUser(4, request(app).get("/"));

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Internal server error." });
            expect(JSON.stringify(response.body)).not.toContain("leaked");
        });
    });

    describe("GET /invitations", () => {
        it("returns pending invitations", async () => {
            gameService.getInvitations.mockReturnValue([room]);

            const response = await asUser(2, request(app).get("/invitations"));

            expect(response.status).toBe(200);
            expect(response.body).toEqual([room]);
            expect(gameService.getInvitations).toHaveBeenCalledWith(2);
        });

        it("returns 500 without leaking the internal error", async () => {
            gameService.getInvitations.mockImplementation(() => {
                throw new Error("invite leaked");
            });

            const response = await asUser(2, request(app).get("/invitations"));

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Internal server error." });
            expect(JSON.stringify(response.body)).not.toContain("leaked");
        });
    });

    describe("PATCH /:id", () => {
        it("accepts an invitation", async () => {
            gameService.acceptInvitation.mockReturnValue({ room: { ...room, status: "active" } });

            const response = await asUser(2, request(app).patch("/room-1")).send({ status: "active" });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ ...room, status: "active" });
            expect(gameService.acceptInvitation).toHaveBeenCalledWith("room-1", 2);
        });

        it.each([
            [{}, "the status is missing"],
            [{ status: "pending" }, "the status is not active"],
            [{ status: "active " }, "the status has extra whitespace"],
        ])("returns 400 when %j (%s)", async (body) => {
            const response = await asUser(2, request(app).patch("/room-1")).send(body);

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: "Bad request." });
            expect(gameService.acceptInvitation).not.toHaveBeenCalled();
        });

        it("returns 404 when the room does not exist", async () => {
            gameService.acceptInvitation.mockReturnValue({ error: "not_found" });

            const response = await asUser(2, request(app).patch("/room-1")).send({ status: "active" });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: "Game room not found." });
        });

        it("returns 403 when the caller cannot accept", async () => {
            gameService.acceptInvitation.mockReturnValue({ error: "forbidden" });

            const response = await asUser(2, request(app).patch("/room-1")).send({ status: "active" });

            expect(response.status).toBe(403);
            expect(response.body).toEqual({ message: "Access denied." });
        });

        it("returns 500 without leaking the internal error", async () => {
            gameService.acceptInvitation.mockImplementation(() => {
                throw new Error("action leaked");
            });

            const response = await asUser(2, request(app).patch("/room-1")).send({ status: "active" });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Internal server error." });
            expect(JSON.stringify(response.body)).not.toContain("leaked");
        });
    });

    describe("DELETE /:id", () => {
        it("leaves the room", async () => {
            gameService.leaveGame.mockReturnValue({ room });

            const response = await asUser(2, request(app).delete("/room-1"));

            expect(response.status).toBe(200);
            expect(response.body).toEqual(room);
            expect(gameService.leaveGame).toHaveBeenCalledWith("room-1", 2);
        });

        it("returns 404 when the room does not exist", async () => {
            gameService.leaveGame.mockReturnValue({ error: "not_found" });

            const response = await asUser(2, request(app).delete("/room-1"));

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: "Game room not found." });
        });

        it("returns 403 when the caller cannot leave", async () => {
            gameService.leaveGame.mockReturnValue({ error: "forbidden" });

            const response = await asUser(2, request(app).delete("/room-1"));

            expect(response.status).toBe(403);
            expect(response.body).toEqual({ message: "Access denied." });
        });

        it("returns 500 without leaking the internal error", async () => {
            gameService.leaveGame.mockImplementation(() => {
                throw new Error("action leaked");
            });

            const response = await asUser(2, request(app).delete("/room-1"));

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Internal server error." });
            expect(JSON.stringify(response.body)).not.toContain("leaked");
        });
    });

    describe("POST /:id/moves", () => {
        it("applies a move object", async () => {
            const move = { from: 1, to: 2 };
            gameService.makeMove.mockReturnValue({ room: { ...room, status: "active" } });

            const response = await asUser(1, request(app).post("/room-1/moves")).send({ move });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ ...room, status: "active" });
            expect(gameService.makeMove).toHaveBeenCalledWith("room-1", {
                userId: 1,
                move,
            });
        });

        it("returns 400 when the move is missing", async () => {
            const response = await asUser(1, request(app).post("/room-1/moves")).send({});

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ message: "Bad request." });
            expect(gameService.makeMove).not.toHaveBeenCalled();
        });

        it("returns 404 when the room does not exist", async () => {
            gameService.makeMove.mockReturnValue({ error: "not_found" });

            const response = await asUser(1, request(app).post("/room-1/moves")).send({
                move: { from: 1 },
            });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ message: "Game room not found." });
        });

        it("returns 403 when the caller cannot move", async () => {
            gameService.makeMove.mockReturnValue({ error: "forbidden" });

            const response = await asUser(1, request(app).post("/room-1/moves")).send({
                move: { from: 1 },
            });

            expect(response.status).toBe(403);
            expect(response.body).toEqual({ message: "Access denied." });
        });

        it.each(["illegal", "not_implemented"])(
            "returns 400 when the rules report %s",
            async (error) => {
                gameService.makeMove.mockReturnValue({ error });

                const response = await asUser(1, request(app).post("/room-1/moves")).send({
                    move: { from: 1 },
                });

                expect(response.status).toBe(400);
                expect(response.body).toEqual({ message: "Illegal move." });
            }
        );

        it("returns 500 without leaking the internal error", async () => {
            gameService.makeMove.mockImplementation(() => {
                throw new Error("rules leaked");
            });

            const response = await asUser(1, request(app).post("/room-1/moves")).send({
                move: { from: 1 },
            });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ message: "Internal server error." });
            expect(JSON.stringify(response.body)).not.toContain("leaked");
        });
    });
});
