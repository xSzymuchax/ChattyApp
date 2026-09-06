import './GamesInvitations.css';

function GamesInvitations({invitations, onAccept, onDecline}) {
    if (!invitations.length) {
        return (
            <div className="games-invitations-empty">
                No invitations yet.
            </div>
        );
    }

}

export default GamesInvitations;
