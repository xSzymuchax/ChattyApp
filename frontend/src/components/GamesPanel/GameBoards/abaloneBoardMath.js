const RADIUS = 4;

export const inBoard = (q, r) =>
    Math.abs(q) <= RADIUS &&
    Math.abs(r) <= RADIUS &&
    Math.abs(q + r) <= RADIUS;

export const allCells = () => {
    const cells = [];
    for (let q = -RADIUS; q <= RADIUS; q++) {
        for (let r = -RADIUS; r <= RADIUS; r++) {
            if (inBoard(q, r))
                cells.push({ q, r });
        }
    }
    return cells;
};
