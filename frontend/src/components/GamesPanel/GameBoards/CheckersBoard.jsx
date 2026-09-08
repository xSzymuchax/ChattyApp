import { useEffect, useMemo, useState } from 'react';
import './CheckersBoard.css';

const SIZE = 8;

function CheckersBoard({room, userId, blocked, onMove}) {
    const [selected, setSelected] = useState(null);
    const gameState = room?.gameState;
    const isRed = Number(userId) === Number(room.secondUserId);
    const myColor = isRed ? 'red' : 'black';
    const canPlay = !blocked && room.status === 'active' && !gameState?.winner;

    const boardRevision = room?.moves?.length ?? 0;

    useEffect(() => {
        if (gameState?.mustContinueFrom)
            setSelected({
                row: gameState.mustContinueFrom.row,
                col: gameState.mustContinueFrom.col,
            });
        else
            setSelected(null);
    }, [
        boardRevision,
        gameState?.turn,
        gameState?.winner,
        gameState?.mustContinueFrom?.row,
        gameState?.mustContinueFrom?.col,
    ]);

    const displayCell = (displayRow, displayCol) => {
        if (isRed)
            return { row: displayRow, col: displayCol };

        return {
            row: SIZE - 1 - displayRow,
            col: SIZE - 1 - displayCol,
        };
    };

    const legalTargets = useMemo(() => {
        const moves = gameState?.legalMoves ?? [];
        const from = selected || gameState?.mustContinueFrom;
        if (!from)
            return [];

        return moves.filter((move) =>
            move.from.row === from.row && move.from.col === from.col
        );
    }, [gameState, selected]);

    const isTarget = (row, col) =>
        legalTargets.some((move) => move.to.row === row && move.to.col === col);

    const handleSquareClick = (row, col) => {
        if (!canPlay || gameState.turn !== myColor)
            return;

        const piece = gameState.board[row][col];
        const continueFrom = gameState.mustContinueFrom;

        if (continueFrom) {
            if (isTarget(row, col)) {
                onMove({ from: continueFrom, to: { row, col } });
            }
            return;
        }

        if (piece && piece.color === myColor) {
            setSelected({ row, col });
            return;
        }

        if (selected && isTarget(row, col)) {
            onMove({ from: selected, to: { row, col } });
            setSelected(null);
            return;
        }

        setSelected(null);
    };

    if (!gameState?.board)
        return null;

    const turnLabel = gameState.winner
        ? `${gameState.winner === 'black' ? 'Black' : 'Red'} wins`
        : gameState.mustContinueFrom
            ? 'Keep capturing'
            : `${gameState.turn === 'black' ? 'Black' : 'Red'} to move`;

    return (
        <div className={`checkers-board ${blocked ? 'blocked' : ''}`}>
            <div className="checkers-status">{turnLabel}</div>
            <div className="checkers-grid">
                {Array.from({ length: SIZE }, (_, displayRow) =>
                    Array.from({ length: SIZE }, (_, displayCol) => {
                        const { row, col } = displayCell(displayRow, displayCol);
                        const piece = gameState.board[row][col];
                        const dark = (row + col) % 2 === 1;
                        const selectedHere =
                            selected?.row === row && selected?.col === col;
                        const continueHere =
                            gameState.mustContinueFrom?.row === row &&
                            gameState.mustContinueFrom?.col === col;

                        return (
                            <button
                                key={`${displayRow}-${displayCol}`}
                                type="button"
                                className={[
                                    'checkers-square',
                                    dark ? 'dark' : 'light',
                                    selectedHere ? 'selected' : '',
                                    isTarget(row, col) ? 'target' : '',
                                    continueHere ? 'continue' : '',
                                ].join(' ')}
                                onClick={() => handleSquareClick(row, col)}
                                disabled={blocked}
                            >
                                {piece && (
                                    <span
                                        className={`checkers-piece ${piece.color} ${piece.king ? 'king' : ''}`}
                                    />
                                )}
                            </button>
                        );
                    })
                )}
            </div>
            <div className="checkers-legend">
                You are {myColor === 'black' ? 'black' : 'red'}. If you can capture again, you must.
            </div>
        </div>
    );
}

export default CheckersBoard;
