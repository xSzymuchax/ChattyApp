const abalone = require("../../../src/modules/game/rules/abalone");

describe("abalone rules", () => {
    it("fills a hex board of radius 4 and lets black move first", () => {
        const state = abalone.createInitialState();

        expect(abalone.allCells()).toHaveLength(61);
        expect(abalone.inBoard(0, 0)).toBe(true);
        expect(abalone.inBoard(4, 4)).toBe(false);
        expect(state.turn).toBe(abalone.BLACK);
        expect(state.scores).toEqual({ black: 0, white: 0 });
        expect(Object.values(state.marbles).filter((color) => color === abalone.BLACK)).toHaveLength(14);
        expect(Object.values(state.marbles).filter((color) => color === abalone.WHITE)).toHaveLength(14);
        expect(state.legalMoves.length).toBeGreaterThan(0);
    });

    it("applies a legal opening move and switches the turn", () => {
        const state = abalone.createInitialState();
        const move = state.legalMoves[0];

        const result = abalone.applyMove(state, {
            userId: 1,
            firstUserId: 1,
            move,
        });

        expect(result.error).toBeUndefined();
        expect(result.gameState.turn).toBe(abalone.WHITE);
        expect(result.gameState.winner).toBeNull();
    });

    it("rejects the second player on black's turn and a malformed move", () => {
        const state = abalone.createInitialState();

        expect(abalone.applyMove(state, {
            userId: 2,
            firstUserId: 1,
            move: state.legalMoves[0],
        })).toEqual({ error: "illegal" });

        expect(abalone.applyMove(state, {
            userId: 1,
            firstUserId: 1,
            move: { dq: 1, dr: 0 },
        })).toEqual({ error: "illegal" });
    });

    it("gives black the win after white loses six marbles", () => {
        const state = abalone.createInitialState();
        state.scores = { black: 0, white: 6 };
        state.legalMoves = abalone.getLegalMoves(state.marbles, abalone.BLACK);
        const move = state.legalMoves[0];

        const result = abalone.applyMove(state, {
            userId: 1,
            firstUserId: 1,
            move,
        });

        expect(result.gameState.winner).toBe(abalone.BLACK);
        expect(result.gameState.legalMoves).toEqual([]);
    });
});
