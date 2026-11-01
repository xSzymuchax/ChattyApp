const RADIUS = 4;
const BLACK = "black";
const WHITE = "white";
const WIN_SCORE = 6;

const DIRS = [
    { dq: 1, dr: 0 },
    { dq: 0, dr: 1 },
    { dq: -1, dr: 1 },
    { dq: -1, dr: 0 },
    { dq: 0, dr: -1 },
    { dq: 1, dr: -1 },
];

const key = (q, r) => `${q},${r}`;

const parseKey = (id) => {
    const [q, r] = id.split(",").map(Number);
    return { q, r };
};

const inBoard = (q, r) =>
    Math.abs(q) <= RADIUS &&
    Math.abs(r) <= RADIUS &&
    Math.abs(q + r) <= RADIUS;

const add = (cell, dir) => ({ q: cell.q + dir.dq, r: cell.r + dir.dr });

const cloneMarbles = (marbles) => ({ ...marbles });

const getAt = (marbles, q, r) => marbles[key(q, r)] ?? null;

const opponentOf = (color) => (color === BLACK ? WHITE : BLACK);

const colorForUser = (userId, firstUserId) =>
    Number(userId) === Number(firstUserId) ? BLACK : WHITE;

const allCells = () => {
    const cells = [];
    for (let q = -RADIUS; q <= RADIUS; q++) {
        for (let r = -RADIUS; r <= RADIUS; r++) {
            if (inBoard(q, r))
                cells.push({ q, r });
        }
    }
    return cells;
};

const startingMarbles = () => {
    const marbles = {};

    const place = (color, positions) => {
        for (const [q, r] of positions)
            marbles[key(q, r)] = color;
    };

    place(BLACK, [
        [-4, 4], [-3, 4], [-2, 4], [-1, 4], [0, 4],
        [-4, 3], [-3, 3], [-2, 3], [-1, 3], [0, 3], [1, 3],
        [-2, 2], [-1, 2], [0, 2],
    ]);

    place(WHITE, [
        [0, -4], [1, -4], [2, -4], [3, -4], [4, -4],
        [-1, -3], [0, -3], [1, -3], [2, -3], [3, -3], [4, -3],
        [0, -2], [1, -2], [2, -2],
    ]);

    return marbles;
};

const sameDir = (a, b) => a.dq === b.dq && a.dr === b.dr;

const marblesOf = (marbles, color) =>
    Object.entries(marbles)
        .filter(([, value]) => value === color)
        .map(([id]) => parseKey(id));

const groupId = (cells) =>
    cells.map((cell) => key(cell.q, cell.r)).sort().join("|");

const sameGroup = (a, b) => groupId(a) === groupId(b);

const collectGroups = (marbles, color) => {
    const groups = [];
    const seen = new Set();

    const pushGroup = (cells) => {
        const id = groupId(cells);
        if (seen.has(id))
            return;
        seen.add(id);
        groups.push(cells);
    };

    const pieces = marblesOf(marbles, color);

    for (const piece of pieces) {
        pushGroup([piece]);

        for (const dir of DIRS) {
            const second = add(piece, dir);
            if (getAt(marbles, second.q, second.r) !== color)
                continue;

            pushGroup([piece, second]);

            const third = add(second, dir);
            if (getAt(marbles, third.q, third.r) === color)
                pushGroup([piece, second, third]);
        }
    }

    return groups;
};

const sortAlong = (group, dir) =>
    [...group].sort((a, b) =>
        (a.q * dir.dq + a.r * dir.dr) - (b.q * dir.dq + b.r * dir.dr)
    );

const axisOf = (group) => {
    if (group.length < 2)
        return null;

    for (const dir of DIRS) {
        const sorted = sortAlong(group, dir);
        let consecutive = true;

        for (let i = 1; i < sorted.length; i++) {
            const expected = add(sorted[i - 1], dir);
            if (expected.q !== sorted[i].q || expected.r !== sorted[i].r) {
                consecutive = false;
                break;
            }
        }

        if (consecutive)
            return dir;
    }

    return null;
};

const isInline = (group, dir) => {
    if (group.length === 1)
        return true;

    const axis = axisOf(group);
    if (!axis)
        return false;

    return sameDir(axis, dir) || sameDir(axis, { dq: -dir.dq, dr: -dir.dr });
};

const describeInline = (marbles, group, dir, color) => {
    const ordered = sortAlong(group, dir);
    const front = ordered[ordered.length - 1];
    const next = add(front, dir);

    if (!inBoard(next.q, next.r))
        return null;

    const occupant = getAt(marbles, next.q, next.r);

    if (!occupant) {
        return { kind: "slide" };
    }

    if (occupant === color)
        return null;

    const opponent = occupant;
    const chain = [];
    let cursor = next;

    while (inBoard(cursor.q, cursor.r) && getAt(marbles, cursor.q, cursor.r) === opponent) {
        chain.push(cursor);
        cursor = add(cursor, dir);
        if (chain.length > 2)
            return null;
    }

    if (chain.length >= group.length)
        return null;

    if (inBoard(cursor.q, cursor.r) && getAt(marbles, cursor.q, cursor.r))
        return null;

    return {
        kind: "push",
        chain,
        eject: !inBoard(cursor.q, cursor.r),
    };
};

const describeBroadside = (marbles, group, dir) => {
    for (const cell of group) {
        const dest = add(cell, dir);
        if (!inBoard(dest.q, dest.r) || getAt(marbles, dest.q, dest.r))
            return null;
    }

    return { kind: "broadside" };
};

const describeMove = (marbles, group, dir, color) => {
    if (isInline(group, dir))
        return describeInline(marbles, group, dir, color);

    return describeBroadside(marbles, group, dir);
};

const getLegalMoves = (marbles, color) => {
    const moves = [];

    for (const group of collectGroups(marbles, color)) {
        for (const dir of DIRS) {
            const described = describeMove(marbles, group, dir, color);
            if (!described)
                continue;

            moves.push({
                marbles: group,
                dq: dir.dq,
                dr: dir.dr,
            });
        }
    }

    return moves;
};

const applyDescribed = (marbles, scores, group, dir, described, color) => {
    const nextMarbles = cloneMarbles(marbles);
    const nextScores = { ...scores };

    if (described.kind === "push") {
        for (let i = described.chain.length - 1; i >= 0; i--) {
            const pos = described.chain[i];
            const marbleColor = nextMarbles[key(pos.q, pos.r)];
            delete nextMarbles[key(pos.q, pos.r)];
            const dest = add(pos, dir);

            if (inBoard(dest.q, dest.r))
                nextMarbles[key(dest.q, dest.r)] = marbleColor;
            else
                nextScores[marbleColor] += 1;
        }
    }

    for (const cell of group)
        delete nextMarbles[key(cell.q, cell.r)];

    for (const cell of group) {
        const dest = add(cell, dir);
        nextMarbles[key(dest.q, dest.r)] = color;
    }

    return { marbles: nextMarbles, scores: nextScores };
};

const winnerFrom = (scores) => {
    if (scores[WHITE] >= WIN_SCORE)
        return BLACK;
    if (scores[BLACK] >= WIN_SCORE)
        return WHITE;
    return null;
};

const createInitialState = () => {
    const marbles = startingMarbles();

    return {
        marbles,
        turn: BLACK,
        scores: { black: 0, white: 0 },
        winner: null,
        legalMoves: getLegalMoves(marbles, BLACK),
    };
};

const applyMove = (gameState, { userId, move, firstUserId }) => {
    if (!gameState || gameState.winner)
        return { error: "illegal" };

    const color = colorForUser(userId, firstUserId);

    if (gameState.turn !== color)
        return { error: "illegal" };

    if (!move?.marbles || move.dq === undefined || move.dr === undefined)
        return { error: "illegal" };

    const dir = { dq: move.dq, dr: move.dr };
    const legal = getLegalMoves(gameState.marbles, color).find((item) =>
        sameGroup(item.marbles, move.marbles) &&
        item.dq === dir.dq &&
        item.dr === dir.dr
    );

    if (!legal)
        return { error: "illegal" };

    const described = describeMove(gameState.marbles, legal.marbles, dir, color);
    if (!described)
        return { error: "illegal" };

    const applied = applyDescribed(
        gameState.marbles,
        gameState.scores,
        legal.marbles,
        dir,
        described,
        color
    );

    const winner = winnerFrom(applied.scores);
    const nextTurn = winner ? color : opponentOf(color);

    return {
        gameState: {
            marbles: applied.marbles,
            turn: nextTurn,
            scores: applied.scores,
            winner,
            legalMoves: winner ? [] : getLegalMoves(applied.marbles, nextTurn),
        },
    };
};

module.exports = {
    BLACK,
    WHITE,
    RADIUS,
    DIRS,
    inBoard,
    allCells,
    createInitialState,
    applyMove,
    getLegalMoves,
    colorForUser,
};
