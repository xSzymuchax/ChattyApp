import './GameBoard.css';
import CheckersBoard from './CheckersBoard';
import AbaloneBoard from './AbaloneBoard';

function GameBoard({room, userId, blocked, error, onLeave, onMove}) {
    return (
        <div className="game-board">
            <div className="game-board-header">
                <h3 className="game-board-title">{room?.gameName}</h3>
                <button type="button" className="game-board-leave" onClick={onLeave}>
                    {blocked ? 'Cancel' : 'Leave'}
                </button>
            </div>
            {blocked && (
                <div className="game-board-blocked">
                    Waiting for the other player to accept.
                </div>
            )}
            {error && (
                <div className="game-board-blocked">{error}</div>
            )}
            {room?.gameName === 'Checkers' ? (
                <CheckersBoard
                    room={room}
                    userId={userId}
                    blocked={blocked}
                    onMove={onMove}
                />
            ) : room?.gameName === 'Abalone' ? (
                <AbaloneBoard
                    room={room}
                    userId={userId}
                    blocked={blocked}
                    onMove={onMove}
                />
            ) : (
                <div className="game-board-placeholder">
                    Board coming soon.
                </div>
            )}
        </div>
    );
}

export default GameBoard;
