const checkers = require("../../../src/modules/game/rules/checkers");

const emptyBoard = () => Array.from({ length: 8 }, () => Array(8).fill(null));

const stateWith = (board, turn = checkers.BLACK) => ({
    board,
    turn,
    winner: null,
    mustContinueFrom: null,
    legalMoves: [],
});

describe("checkers rules", () => {
    it("starts with twelve pieces of each color and black to move", () => {
        const state = checkers.createInitialState();
        const pieces = state.board.flat().filter(Boolean);

        expect(state.turn).toBe(checkers.BLACK);
        expect(state.winner).toBeNull();
        expect(pieces.filter((piece) => piece.color === checkers.BLACK)).toHaveLength(12);
        expect(pieces.filter((piece) => piece.color === checkers.RED)).toHaveLength(12);
        expect(state.legalMoves.length).toBeGreaterThan(0);
        expect(state.legalMoves.every((move) => move.capture === null)).toBe(true);
    });

    it("plays a legal opening step and gives the turn to red", () => {
        const state = checkers.createInitialState();
        const move = state.legalMoves[0];

        const result = checkers.applyMove(state, {
            userId: 1,
            firstUserId: 1,
            move: { from: move.from, to: move.to },
        });

        expect(result.error).toBeUndefined();
        expect(result.gameState.turn).toBe(checkers.RED);
        expect(result.gameState.board[move.from.row][move.from.col]).toBeNull();
        expect(result.gameState.board[move.to.row][move.to.col].color).toBe(checkers.BLACK);
    });

    it("rejects a move from the player who is not to move", () => {
        const state = checkers.createInitialState();
        const move = state.legalMoves[0];

        const result = checkers.applyMove(state, {
            userId: 2,
            firstUserId: 1,
            move: { from: move.from, to: move.to },
        });

        expect(result).toEqual({ error: "illegal" });
    });

    it("captures a piece, promotes on the last rank, and ends the game", () => {
        const board = emptyBoard();
        board[5][2] = { color: checkers.BLACK, king: false };
        board[6][3] = { color: checkers.RED, king: false };

        const result = checkers.applyMove(stateWith(board), {
            userId: 1,
            firstUserId: 1,
            move: { from: { row: 5, col: 2 }, to: { row: 7, col: 4 } },
        });

        expect(result.gameState.winner).toBe(checkers.BLACK);
        expect(result.gameState.board[6][3]).toBeNull();
        expect(result.gameState.board[7][4]).toEqual({ color: checkers.BLACK, king: true });
        expect(result.gameState.legalMoves).toEqual([]);
    });

    it("rejects a finished game and a move that is not on the legal list", () => {
        const finished = checkers.createInitialState();
        finished.winner = checkers.RED;

        expect(checkers.applyMove(finished, {
            userId: 1,
            firstUserId: 1,
            move: { from: { row: 2, col: 1 }, to: { row: 3, col: 0 } },
        })).toEqual({ error: "illegal" });

        expect(checkers.applyMove(checkers.createInitialState(), {
            userId: 1,
            firstUserId: 1,
            move: { from: { row: 0, col: 0 }, to: { row: 1, col: 1 } },
        })).toEqual({ error: "illegal" });
    });
});
