import './GameCard.css';

function GameCard({game, onSelect}) {
    return (
        <button type="button" className="game-card" onClick={() => onSelect(game)}>
            <i className="icon-gamepad"></i>
            <div className="game-card-text">
                <span className="game-card-name">{game.name}</span>
                <span className="game-card-description">{game.description}</span>
            </div>
        </button>
    );
}

export default GameCard;
