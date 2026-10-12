import './GamesPanel.css'
import GameBoard from './GameBoards/GameBoard';
import GamesList from './GamesList';
import GamesInvitations from './GamesInvitations';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { getUserById } from '../../api/user';
import { getGameInvitations, getUserGames } from '../../api/game';
import { useSocket } from '../../websocket/WebSocketContext';
import { playGameInviteSound } from '../../util/messageSound';
import { buildGameInviteMessage } from '../../util/gameInviteMessage';

function GamesPanel({visible, onToggle, opponent, chatId, invitationsTabToken, onChatMessage}){
    const { userId } = useAuth();
    const { socket, subscribeToMessages } = useSocket();
    const [idleView, setIdleView] = useState('games');
    const [room, setRoom] = useState(null);
    const [invitations, setInvitations] = useState([]);
    const [hasUnreadInvites, setHasUnreadInvites] = useState(false);
    const [selectError, setSelectError] = useState('');
    const [username, setUsername] = useState('');
    const pendingInviteRef = useRef(null);
    const inviteMessageIdRef = useRef(-1);

    const isPlaying = Boolean(room);
    const chatIdRef = useRef(chatId);
    const usernameRef = useRef(username);
    const onChatMessageRef = useRef(onChatMessage);
    const socketRef = useRef(socket);

    chatIdRef.current = chatId;
    usernameRef.current = username;
    onChatMessageRef.current = onChatMessage;
    socketRef.current = socket;

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
            setHasUnreadInvites(withNames.length > 0);
        } catch (error) {
            console.log(error);
        }
    }, [userId]);

    useEffect(() => {
        loadCurrentRoom();
        loadInvitations();
    }, [loadCurrentRoom, loadInvitations]);

    useEffect(() => {
        const loadUsername = async () => {
            if (!userId) {
                setUsername('');
                return;
            }

            try {
                const response = await getUserById(userId);
                setUsername(response.data.username ?? '');
            } catch (error) {
                console.log(error);
            }
        };

        loadUsername();
    }, [userId]);

    useEffect(() => {
        if (!invitationsTabToken) {
            return;
        }

        setIdleView('invitations');
        setHasUnreadInvites(false);
    }, [invitationsTabToken]);

    const sendInviteChatMessage = async (gameName) => {
        const activeChatId = chatIdRef.current;

        const activeSocket = socketRef.current;

        if (!activeChatId || !activeSocket || activeSocket.readyState !== WebSocket.OPEN) {
            return;
        }

        let senderName = usernameRef.current;

        if (!senderName && userId) {
            try {
                const response = await getUserById(userId);
                senderName = response.data.username ?? `User ${userId}`;
            } catch (error) {
                console.log(error);
                senderName = `User ${userId}`;
            }
        }

        const content = buildGameInviteMessage(senderName, gameName);
        activeSocket.send(JSON.stringify({
            type: 'message',
            chatId: activeChatId,
            content,
        }));

        inviteMessageIdRef.current -= 1;
        onChatMessageRef.current?.({
            chatId: activeChatId,
            id: inviteMessageIdRef.current,
            senderId: userId,
            content,
            createdAt: new Date().toISOString(),
        });
    };

    useEffect(() => {
        if (invitations.length === 0) {
            setHasUnreadInvites(false);
        }
    }, [invitations.length]);

    useEffect(() => {
        const unsubscribe = subscribeToMessages((message) => {
            if (message.type === 'gameInvite') {
                const rawInvite = message.message;
                playGameInviteSound();

                if (!(visible && idleView === 'invitations')) {
                    setHasUnreadInvites(true);
                }

                setInvitations((prev) => {
                    if (prev.some((item) => item.id === rawInvite.id)) {
                        return prev;
                    }

                    return [
                        ...prev,
                        {
                            ...rawInvite,
                            fromUsername: `User ${rawInvite.firstUserId}`,
                        },
                    ];
                });

                withHostName(rawInvite).then((invitation) => {
                    setInvitations((prev) =>
                        prev.map((item) => (item.id === invitation.id ? invitation : item))
                    );
                });
                return;
            }

            if (message.type === 'gameUpdate') {
                const nextRoom = message.message;
                const pendingInvite = pendingInviteRef.current;
                setSelectError('');
                setRoom(nextRoom);
                setInvitations((prev) => prev.filter((item) => item.id !== nextRoom.id));

                if (
                    pendingInvite &&
                    nextRoom.status === 'pending' &&
                    Number(nextRoom.firstUserId) === Number(userId)
                ) {
                    pendingInviteRef.current = null;
                    sendInviteChatMessage(pendingInvite.gameName || nextRoom.gameName);
                }

                return;
            }

            if (message.type === 'gameEnded') {
                const roomId = message.message?.roomId;
                setRoom((current) => (current?.id === roomId ? null : current));
                setInvitations((prev) => prev.filter((item) => item.id !== roomId));
                return;
            }

            if (message.type === 'gameError') {
                pendingInviteRef.current = null;
                setSelectError(message.message?.message || 'Game error.');
                return;
            }
        });

        return unsubscribe;
    }, [subscribeToMessages, visible, idleView, userId]);

    const handleSelectGame = (game) => {
        setSelectError('');

        if (!userId || !opponent?.id || !chatId) {
            setSelectError('Open a chat to invite someone.');
            return;
        }

        pendingInviteRef.current = { gameName: game.name };
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
            <div
                className='toggle-panel-switch'
                onClick={onToggle}
                aria-label={hasUnreadInvites ? "Games panel, new invitation" : "Games panel"}
            >
                {hasUnreadInvites && (
                    <span className="games-toggle-unread-dot" aria-hidden="true"></span>
                )}
            </div>
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
                                onClick={() => {
                                    setIdleView('invitations');
                                    setHasUnreadInvites(false);
                                }}
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
