import { useEffect, useMemo, useState } from 'react';
import './AbaloneBoard.css';
import { allCells, inBoard } from './abaloneBoardMath';

const SIZE = 18;
const SQRT3 = Math.sqrt(3);

const hexPoints = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30);
    return `${SIZE * Math.cos(angle)},${SIZE * Math.sin(angle)}`;
}).join(' ');

const pixel = (q, r) => ({
    x: SIZE * SQRT3 * (q + r / 2),
    y: SIZE * 1.5 * r,
});

const cellKey = (q, r) => `${q},${r}`;

const sameCells = (a, b) => {
    if (a.length !== b.length)
        return false;
    const left = a.map((cell) => cellKey(cell.q, cell.r)).sort().join('|');
    const right = b.map((cell) => cellKey(cell.q, cell.r)).sort().join('|');
    return left === right;
};

const isNeighbor = (a, b) =>
    (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs((a.q + a.r) - (b.q + b.r))) / 2 === 1;

const isValidGroup = (cells) => {
    if (cells.length === 0 || cells.length > 3)
        return false;
    if (cells.length === 1)
        return true;
    if (cells.length === 2)
        return isNeighbor(cells[0], cells[1]);

    const dirs = [
        { dq: 1, dr: 0 },
        { dq: 0, dr: 1 },
        { dq: -1, dr: 1 },
    ];

    for (const dir of dirs) {
        const sorted = [...cells].sort((a, b) =>
            (a.q * dir.dq + a.r * dir.dr) - (b.q * dir.dq + b.r * dir.dr)
        );
        if (
            sorted[1].q === sorted[0].q + dir.dq &&
            sorted[1].r === sorted[0].r + dir.dr &&
            sorted[2].q === sorted[1].q + dir.dq &&
            sorted[2].r === sorted[1].r + dir.dr
        )
            return true;
    }

    return false;
};

function AbaloneBoard({room, userId, blocked, onMove}) {
    const [selected, setSelected] = useState([]);
    const gameState = room?.gameState;
    const isWhite = Number(userId) === Number(room.secondUserId);
    const myColor = isWhite ? 'white' : 'black';
    const canPlay = !blocked && room.status === 'active' && !gameState?.winner;
    const flip = isWhite;

    useEffect(() => {
        setSelected([]);
    }, [gameState?.turn, room?.moves?.length]);

    const toDisplay = (q, r) => (flip ? { q: -q, r: -r } : { q, r });

    const layout = useMemo(() => {
        const cells = allCells().map((cell) => {
            const display = toDisplay(cell.q, cell.r);
            const { x, y } = pixel(display.q, display.r);
            return { ...cell, x, y };
        });
        const xs = cells.map((cell) => cell.x);
        const ys = cells.map((cell) => cell.y);
        const pad = SIZE + 4;
        const minX = Math.min(...xs) - pad;
        const minY = Math.min(...ys) - pad;
        const maxX = Math.max(...xs) + pad;
        const maxY = Math.max(...ys) + pad;
        return {
            cells,
            viewBox: `${minX} ${minY} ${maxX - minX} ${maxY - minY}`,
        };
    }, [flip]);

    const marbleAt = (q, r) => gameState?.marbles?.[cellKey(q, r)] ?? null;

    const matchingMoves = useMemo(() => {
        if (!selected.length)
            return [];
        return (gameState?.legalMoves ?? []).filter((move) =>
            sameCells(move.marbles, selected)
        );
    }, [gameState, selected]);

    const targets = useMemo(() => {
        const selectedKeys = new Set(selected.map((cell) => cellKey(cell.q, cell.r)));
        const next = new Set();
        for (const move of matchingMoves) {
            for (const cell of move.marbles) {
                const dest = { q: cell.q + move.dq, r: cell.r + move.dr };
                if (inBoard(dest.q, dest.r) && !selectedKeys.has(cellKey(dest.q, dest.r)))
                    next.add(cellKey(dest.q, dest.r));
            }
        }
        return next;
    }, [matchingMoves, selected]);

    const selectedSet = new Set(selected.map((cell) => cellKey(cell.q, cell.r)));

    const handleCellClick = (q, r) => {
        if (!canPlay || gameState.turn !== myColor)
            return;

        const targetKey = cellKey(q, r);
        if (targets.has(targetKey)) {
            const move = matchingMoves.find((item) =>
                item.marbles.some((cell) =>
                    cell.q + item.dq === q && cell.r + item.dr === r
                )
            );
            if (move) {
                onMove({
                    marbles: move.marbles,
                    dq: move.dq,
                    dr: move.dr,
                });
                setSelected([]);
            }
            return;
        }

        const marble = marbleAt(q, r);
        if (marble !== myColor) {
            setSelected([]);
            return;
        }

        const exists = selected.some((cell) => cell.q === q && cell.r === r);
        const next = exists
            ? selected.filter((cell) => !(cell.q === q && cell.r === r))
            : [...selected, { q, r }];

        if (!next.length || isValidGroup(next))
            setSelected(next);
    };

    if (!gameState?.marbles)
        return null;

    const turnLabel = gameState.winner
        ? `${gameState.winner === 'black' ? 'Black' : 'White'} wins`
        : `${gameState.turn === 'black' ? 'Black' : 'White'} to move`;

    return (
        <div className={`abalone-board ${blocked ? 'blocked' : ''}`}>
            <div className="abalone-status">
                {turnLabel} · Black {gameState.scores.white} - {gameState.scores.black} White
            </div>
            <svg className="abalone-svg" viewBox={layout.viewBox}>
                {layout.cells.map((cell) => {
                    const marble = marbleAt(cell.q, cell.r);
                    const id = cellKey(cell.q, cell.r);
                    return (
                        <g
                            key={id}
                            transform={`translate(${cell.x}, ${cell.y})`}
                            onClick={() => handleCellClick(cell.q, cell.r)}
                        >
                            <polygon
                                points={hexPoints}
                                className={[
                                    'abalone-hex',
                                    selectedSet.has(id) ? 'selected' : '',
                                    targets.has(id) ? 'target' : '',
                                ].join(' ')}
                            />
                            {marble && (
                                <circle
                                    r={SIZE * 0.55}
                                    className={`abalone-marble ${marble}`}
                                />
                            )}
                        </g>
                    );
                })}
            </svg>
            <div className="abalone-legend">
                You are {myColor}. Select 1-3 marbles in a line, then a highlighted hex.
                First to push 6 off the board wins.
            </div>
        </div>
    );
}

export default AbaloneBoard;
