const SIZE = 8;
const BLACK = "black";
const RED = "red";

const isOnBoard = (row, col) =>
    row >= 0 && row < SIZE && col >= 0 && col < SIZE;

const isDarkSquare = (row, col) => (row + col) % 2 === 1;

const cloneBoard = (board) =>
    board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));

const opponentOf = (color) => (color === BLACK ? RED : BLACK);

const moveDirections = (piece) => {
    if (piece.king)
        return [[-1, -1], [-1, 1], [1, -1], [1, 1]];

    return piece.color === BLACK
        ? [[1, -1], [1, 1]]
        : [[-1, -1], [-1, 1]];
};

const jumpDirections = () => [
    [-1, -1], [-1, 1], [1, -1], [1, 1],
];

const shouldKing = (piece, row) => {
    if (piece.king)
        return false;

    return (piece.color === BLACK && row === SIZE - 1) ||
        (piece.color === RED && row === 0);
};

const getJumpsFrom = (board, row, col, piece) => {
    const jumps = [];

    for (const [dRow, dCol] of jumpDirections()) {
        const midRow = row + dRow;
        const midCol = col + dCol;
        const landRow = row + dRow * 2;
        const landCol = col + dCol * 2;

        if (!isOnBoard(landRow, landCol))
            continue;

        const mid = board[midRow]?.[midCol];
        const land = board[landRow][landCol];

        if (mid && mid.color === opponentOf(piece.color) && !land)
            jumps.push({
                from: { row, col },
                to: { row: landRow, col: landCol },
                capture: { row: midRow, col: midCol },
            });
    }

    return jumps;
};

const getStepsFrom = (board, row, col, piece) => {
    const steps = [];

    for (const [dRow, dCol] of moveDirections(piece)) {
        const nextRow = row + dRow;
        const nextCol = col + dCol;

        if (!isOnBoard(nextRow, nextCol))
            continue;

        if (!board[nextRow][nextCol])
            steps.push({
                from: { row, col },
                to: { row: nextRow, col: nextCol },
                capture: null,
            });
    }

    return steps;
};

const piecesOf = (board, color) => {
    const pieces = [];

    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            const cell = board[row][col];
            if (cell && cell.color === color)
                pieces.push({ row, col, piece: cell });
        }
    }

    return pieces;
};

const getLegalMoves = (board, color, mustContinueFrom) => {
    if (mustContinueFrom) {
        const { row, col } = mustContinueFrom;
        const piece = board[row][col];
        if (!piece || piece.color !== color)
            return [];

        return getJumpsFrom(board, row, col, piece);
    }

    const pieces = piecesOf(board, color);
    const jumps = pieces.flatMap(({ row, col, piece }) =>
        getJumpsFrom(board, row, col, piece)
    );

    if (jumps.length)
        return jumps;

    return pieces.flatMap(({ row, col, piece }) =>
        getStepsFrom(board, row, col, piece)
    );
};

const sameSquare = (a, b) => a.row === b.row && a.col === b.col;

const colorForUser = (userId, firstUserId) =>
    Number(userId) === Number(firstUserId) ? BLACK : RED;

const createInitialState = () => {
    const board = [];

    for (let row = 0; row < SIZE; row++) {
        const line = [];
        for (let col = 0; col < SIZE; col++) {
            if (!isDarkSquare(row, col)) {
                line.push(null);
                continue;
            }

            if (row <= 2)
                line.push({ color: BLACK, king: false });
            else if (row >= 5)
                line.push({ color: RED, king: false });
            else
                line.push(null);
        }
        board.push(line);
    }

    return {
        board,
        turn: BLACK,
        winner: null,
        mustContinueFrom: null,
        legalMoves: getLegalMoves(board, BLACK, null),
    };
};

const applyMove = (gameState, { userId, move, firstUserId }) => {
    if (!gameState || gameState.winner)
        return { error: "illegal" };

    const color = colorForUser(userId, firstUserId);

    if (gameState.turn !== color)
        return { error: "illegal" };

    if (!move?.from || !move?.to)
        return { error: "illegal" };

    const legalMoves = getLegalMoves(
        gameState.board,
        color,
        gameState.mustContinueFrom
    );

    const chosen = legalMoves.find((legal) =>
        sameSquare(legal.from, move.from) && sameSquare(legal.to, move.to)
    );

    if (!chosen)
        return { error: "illegal" };

    const board = cloneBoard(gameState.board);
    const piece = { ...board[chosen.from.row][chosen.from.col] };

    board[chosen.from.row][chosen.from.col] = null;

    if (chosen.capture)
        board[chosen.capture.row][chosen.capture.col] = null;

    const crowned = shouldKing(piece, chosen.to.row);
    if (crowned)
        piece.king = true;

    board[chosen.to.row][chosen.to.col] = piece;

    let turn = color;
    let mustContinueFrom = null;
    let winner = null;

    const extraJumps = chosen.capture
        ? getJumpsFrom(board, chosen.to.row, chosen.to.col, piece)
        : [];

    if (extraJumps.length) {
        mustContinueFrom = { row: chosen.to.row, col: chosen.to.col };
    } else {
        turn = opponentOf(color);
        const opponentMoves = getLegalMoves(board, turn, null);
        const opponentPieces = piecesOf(board, turn);

        if (!opponentPieces.length || !opponentMoves.length)
            winner = color;
    }

    const nextState = {
        board,
        turn,
        winner,
        mustContinueFrom,
        legalMoves: winner ? [] : getLegalMoves(board, turn, mustContinueFrom),
    };

    return { gameState: nextState };
};

module.exports = {
    BLACK,
    RED,
    createInitialState,
    applyMove,
    getLegalMoves,
    colorForUser,
};
