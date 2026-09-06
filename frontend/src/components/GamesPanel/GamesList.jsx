import './GamesList.css';
import GameCard from './GameCard';

const PLACEHOLDER_GAMES = [
    { id: 1, name: 'Game 1', description: 'Description 1' },
    { id: 2, name: 'Game 2', description: 'Description 2' },
    { id: 3, name: 'Game 3', description: 'Description 3' },
];

function GamesList() {
    return (
        <div>
            {PLACEHOLDER_GAMES.map((game) => (
                <GameCard key={game.id} game={game} />
            ))}
        </div>
    );
}

export default GamesList;