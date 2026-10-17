const request = require("supertest");
const app = require("../../../src/app");

describe("game integration", () => {
    const createdIds = [];

    afterEach(async () => {
        for (const id of createdIds) {
            await request(app).post(`/${id}/leave`).send({ userId: 11 });
        }
        createdIds.length = 0;
    });

    it("plays a checkers invitation through the HTTP API", async () => {
        const created = await request(app).post("/").send({
            gameName: "Checkers",
            firstUserId: 11,
            secondUserId: 12,
        });

        expect(created.status).toBe(200);
        createdIds.push(created.body.id);
        expect(created.body.status).toBe("pending");
        expect(created.body.gameName).toBe("Checkers");

        const invitations = await request(app).get("/invitations/12");
        expect(invitations.status).toBe(200);
        expect(invitations.body.map((room) => room.id)).toEqual([created.body.id]);

        const accepted = await request(app)
            .post(`/${created.body.id}/accept`)
            .send({ userId: 12 });
        expect(accepted.status).toBe(200);
        expect(accepted.body.status).toBe("active");

        const move = created.body.gameState.legalMoves[0];
        const played = await request(app)
            .post(`/${created.body.id}/move`)
            .send({
                userId: 11,
                move: { from: move.from, to: move.to },
            });

        expect(played.status).toBe(200);
        expect(played.body.moves).toHaveLength(1);
        expect(played.body.gameState.turn).toBe("red");

        const fetched = await request(app).get(`/${created.body.id}`);
        expect(fetched.status).toBe(200);
        expect(fetched.body.moves).toHaveLength(1);
    });

    it("rejects a second room for a busy player and an illegal move", async () => {
        const created = await request(app).post("/").send({
            gameName: "Abalone",
            firstUserId: 11,
            secondUserId: 12,
        });
        createdIds.push(created.body.id);

        const busy = await request(app).post("/").send({
            gameName: "Abalone",
            firstUserId: 11,
            secondUserId: 13,
        });
        expect(busy.status).toBe(409);
        expect(busy.body).toEqual({ message: "User is already in a game." });

        await request(app).post(`/${created.body.id}/accept`).send({ userId: 12 });

        const illegal = await request(app)
            .post(`/${created.body.id}/move`)
            .send({
                userId: 11,
                move: { marbles: [{ q: 0, r: 0 }], dq: 1, dr: 0 },
            });

        expect(illegal.status).toBe(400);
        expect(illegal.body).toEqual({ message: "Illegal move." });
    });
});
