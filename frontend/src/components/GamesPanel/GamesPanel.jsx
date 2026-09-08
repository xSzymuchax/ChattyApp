import './GamesPanel.css'
import GameBoard from './GameBoards/GameBoard';
import GamesList from './GamesList';
import GamesInvitations from './GamesInvitations';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { getUserById } from '../../api/user';
import { getGameInvitations, getUserGames } from '../../api/game';
import { useSocket } from '../../websocket/WebSocketContext';

function GamesPanel({visible, onToggle, opponent}){
    const { userId } = useAuth();
    const { socket, subscribeToMessages } = useSocket();
    const [idleView, setIdleView] = useState('games');
    const [room, setRoom] = useState(null);
    const [invitations, setInvitations] = useState([]);
    const [selectError, setSelectError] = useState('');

    const isPlaying = Boolean(room);

    const sendGameEvent = (payload) => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            setSelectError('Not connected.');
            return false;
        }

        socket.send(JSON.stringify(payload));
        return true;
    };

    const withHostName = async (invitation) => {
        try {
            const userResponse = await getUserById(invitation.firstUserId);
            return {
                ...invitation,
                fromUsername: userResponse.data.username,
            };
        } catch (error) {
            console.log(error);
            return {
                ...invitation,
                fromUsername: `User ${invitation.firstUserId}`,
            };
        }
    };

    const loadCurrentRoom = useCallback(async () => {
        if (!userId)
            return;

        try {
            const response = await getUserGames(userId);
            const rooms = response.data ?? [];
            const current = rooms.find((item) =>
                item.status === 'active' ||
                (item.status === 'pending' && Number(item.firstUserId) === Number(userId))
            );
            setRoom(current ?? null);
        } catch (error) {
            console.log(error);
        }
    }, [userId]);

    const loadInvitations = useCallback(async () => {
        if (!userId)
            return;

        try {
            const response = await getGameInvitations(userId);
            const pending = response.data ?? [];
            const withNames = await Promise.all(pending.map(withHostName));
            setInvitations(withNames);
        } catch (error) {
            console.log(error);
        }
    }, [userId]);

    useEffect(() => {
        loadCurrentRoom();
        loadInvitations();
    }, [loadCurrentRoom, loadInvitations]);

    useEffect(() => {
        const unsubscribe = subscribeToMessages((message) => {
            if (message.type === 'gameInvite') {
                withHostName(message.message).then((invitation) => {
                    setInvitations((prev) => {
                        if (prev.some((item) => item.id === invitation.id))
                            return prev;
                        return [...prev, invitation];
                    });
                });
                return;
            }

            if (message.type === 'gameUpdate') {
                const nextRoom = message.message;
                setSelectError('');
                setRoom(nextRoom);
                setInvitations((prev) => prev.filter((item) => item.id !== nextRoom.id));
                return;
            }

            if (message.type === 'gameEnded') {
                const roomId = message.message?.roomId;
                setRoom((current) => (current?.id === roomId ? null : current));
                setInvitations((prev) => prev.filter((item) => item.id !== roomId));
                return;
            }

            if (message.type === 'gameError') {
                setSelectError(message.message?.message || 'Game error.');
                return;
            }
        });

        return unsubscribe;
    }, [subscribeToMessages]);

    const handleSelectGame = (game) => {
        setSelectError('');

        if (!userId || !opponent?.id) {
            setSelectError('Open a chat to invite someone.');
            return;
        }

        sendGameEvent({
            type: 'gameCreate',
            gameName: game.name,
            secondUserId: opponent.id,
        });
    };

    const handleAccept = (invitation) => {
        sendGameEvent({
            type: 'gameAccept',
            roomId: invitation.id,
        });
    };

    const handleDecline = (invitation) => {
        sendGameEvent({
            type: 'gameLeave',
            roomId: invitation.id,
        });
    };

    const handleLeave = () => {
        if (!room)
            return;

        const roomId = room.id;
        setRoom(null);
        sendGameEvent({
            type: 'gameLeave',
            roomId,
        });
    };

    const handleMove = (move) => {
        if (!room)
            return;

        sendGameEvent({
            type: 'gameMove',
            roomId: room.id,
            move,
        });
    };

    return(
        <div className={`games-panel ${visible ? 'visible' : ''}`}>
            <div className='toggle-panel-switch' onClick={onToggle}/>
            <div className='games-panel-content'>
                <h2 className='games-panel-title'>Games Panel</h2>
                {isPlaying ? (
                    <GameBoard
                        room={room}
                        userId={userId}
                        blocked={room.status === 'pending'}
                        error={selectError}
                        onLeave={handleLeave}
                        onMove={handleMove}
                    />
                ) : (
                    <>
                        <div className='tab-switcher'>
                            <div
                                className={`toggle-panel-switch ${idleView === 'games' ? 'active' : ''}`}
                                onClick={() => setIdleView('games')}
                            >
                                Games
                            </div>
                            <div
                                className={`toggle-panel-switch ${idleView === 'invitations' ? 'active' : ''}`}
                                onClick={() => setIdleView('invitations')}
                            >
                                Invitations
                            </div>
                        </div>
                        {idleView === 'games' ? (
                            <>
                                {selectError && (
                                    <div className='games-select-error'>{selectError}</div>
                                )}
                                <GamesList onSelectGame={handleSelectGame} />
                            </>
                        ) : (
                            <GamesInvitations
                                invitations={invitations}
                                onAccept={handleAccept}
                                onDecline={handleDecline}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default GamesPanel;
