import './GamesInvitations.css';

function GamesInvitations({invitations, onAccept, onDecline}) {
    if (!invitations.length) {
        return (
            <div className="games-invitations-empty">
                No invitations yet.
            </div>
        );
    }

    return (
        <div className="games-invitations">
            {invitations.map((invitation) => (
                <div key={invitation.id} className="game-invitation-card">
                    <div className="game-invitation-text">
                        <span className="game-invitation-name">{invitation.gameName}</span>
                        <span className="game-invitation-from">
                            From {invitation.fromUsername}
                        </span>
                    </div>
                    <div className="game-invitation-actions">
                        <button type="button" onClick={() => onAccept(invitation)}>
                            Accept
                        </button>
                        <button
                            type="button"
                            className="decline"
                            onClick={() => onDecline(invitation)}
                        >
                            Decline
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default GamesInvitations;
