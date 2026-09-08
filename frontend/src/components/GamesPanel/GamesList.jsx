import './GamesList.css';
import GameCard from './GameCard';

const GAMES = [
    { name: 'Checkers', description: 'Classic checkers game.' },
    { name: 'Abalone', description: 'Push 6 opponent marbles off the board.' },
];

function GamesList({onSelectGame}) {
    return (
        <div className="games-list">
            {GAMES.map((game) => (
                <GameCard key={game.name} game={game} onSelect={onSelectGame} />
            ))}
        </div>
    );
}

export default GamesList;
