import { useEffect, useState } from 'react';
import SearchBar from '../SearchBar';
import UserAvatar from '../UserAvatar';
import { useAuth } from '../../auth/AuthContext';
import { getUserWithMatchingUsername } from '../../api/user';
import { addChatMember, grantChatAdmin, removeChatMember } from '../../api/chat';
import './GroupChatSettings.css';

const MAX_MEMBERS = 50;

function GroupChatSettings({ chat, profiles, onClose, onChatChange, onLeft }) {
    const { userId } = useAuth();
    const [busyUserId, setBusyUserId] = useState(null);
    const [leaving, setLeaving] = useState(false);
    const [picking, setPicking] = useState(false);
    const [foundUsers, setFoundUsers] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [knownUsers, setKnownUsers] = useState({});
    const [error, setError] = useState('');
    const viewerId = Number(userId);
    const memberIds = (chat?.memberIds ?? []).map(Number);
    const adminIds = new Set((chat?.adminIds ?? []).map(Number));
    const isViewerAdmin = adminIds.has(viewerId);
    const isFull = memberIds.length >= MAX_MEMBERS;

    const members = memberIds
        .map((memberId) => {
            return profiles[memberId] ?? knownUsers[memberId] ?? { id: memberId, username: '' };
        })
        .sort((left, right) => (left.username ?? '').localeCompare(right.username ?? '', undefined, {
            sensitivity: 'base',
        }));

    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key !== 'Escape') {
                return;
            }

            if (picking) {
                setPicking(false);
                return;
            }

            onClose();
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onClose, picking]);

    const searchUsers = async (username) => {
        const query = username?.trim();

        if (!query) {
            setFoundUsers([]);
            setHasSearched(false);
            return;
        }

        try {
            const response = await getUserWithMatchingUsername(query);
            const users = Array.isArray(response.data) ? response.data : [];
            const currentMembers = new Set(memberIds);
            const available = users.filter((user) => !currentMembers.has(Number(user.id)));
            setKnownUsers((prev) => {
                const next = { ...prev };
                available.forEach((user) => {
                    next[Number(user.id)] = user;
                });
                return next;
            });
            setFoundUsers(available);
            setHasSearched(true);
        } catch (searchError) {
            console.log(searchError);
            setFoundUsers([]);
            setHasSearched(true);
        }
    };

    const addMember = async (memberId) => {
        setBusyUserId(memberId);
        setError('');

        try {
            const response = await addChatMember(chat.id, memberId);
            setFoundUsers((prev) => prev.filter((user) => Number(user.id) !== memberId));
            onChatChange(response.data);
        } catch (actionError) {
            console.log(actionError);
            setError(actionError.response?.data?.message || 'Could not add that person.');
        } finally {
            setBusyUserId(null);
        }
    };

    const runAction = async (memberId, action) => {
        setBusyUserId(memberId);
        setError('');

        try {
            const response = await action(chat.id, memberId);
            onChatChange(response.data);
        } catch (actionError) {
            console.log(actionError);
            setError(actionError.response?.data?.message || 'Could not update the group.');
        } finally {
            setBusyUserId(null);
        }
    };

    const leaveChat = async () => {
        setLeaving(true);
        setError('');

        try {
            await removeChatMember(chat.id, viewerId);
            onLeft();
        } catch (actionError) {
            console.log(actionError);
            setError(actionError.response?.data?.message || 'Could not leave the chat.');
            setLeaving(false);
        }
    };

    return (
        <div className="group-settings-overlay" onClick={onClose}>
            <div
                className="group-settings-dialog"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="group-settings-title"
            >
                <h2 id="group-settings-title">{chat?.name || 'Group'}</h2>
                {picking && <SearchBar onSearch={searchUsers} />}
                <div className="group-settings-list">
                    {picking ? (
                        foundUsers.length === 0 ? (
                            <p className="group-settings-empty">
                                {hasSearched ? 'No users found' : 'Search for people to add'}
                            </p>
                        ) : (
                            foundUsers.map((user) => {
                                const memberId = Number(user.id);
                                const busy = busyUserId === memberId;

                                return (
                                    <div key={memberId} className="group-settings-user">
                                        <span className="profile-picture">
                                            <UserAvatar
                                                userId={user.id}
                                                username={user.username}
                                                hasAvatar={user.hasAvatar}
                                                version={user.updatedAt}
                                            />
                                        </span>
                                        <span className="username">{user.username}</span>
                                        <button
                                            type="button"
                                            className="group-settings-grant"
                                            disabled={busy || leaving || isFull}
                                            onClick={() => addMember(memberId)}
                                        >
                                            Add
                                        </button>
                                    </div>
                                );
                            })
                        )
                    ) : members.length === 0 ? (
                        <p className="group-settings-empty">No members</p>
                    ) : (
                        members.map((member) => {
                            const memberId = Number(member.id);
                            const isSelf = memberId === viewerId;
                            const isAdmin = adminIds.has(memberId);
                            const busy = busyUserId === memberId;

                            return (
                                <div key={memberId} className="group-settings-user">
                                    <span className="profile-picture">
                                        <UserAvatar
                                            userId={member.id}
                                            username={member.username}
                                            hasAvatar={member.hasAvatar}
                                            version={member.updatedAt}
                                        />
                                    </span>
                                    <span className="username">
                                        {member.username || `User ${memberId}`}
                                    </span>
                                    {isViewerAdmin && !isSelf && (
                                        <span className="group-settings-actions">
                                            <button
                                                type="button"
                                                className="group-settings-remove"
                                                disabled={busy || leaving}
                                                onClick={() => runAction(memberId, removeChatMember)}
                                            >
                                                Remove
                                            </button>
                                            {isAdmin ? (
                                                <span className="group-settings-admin">Admin</span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="group-settings-grant"
                                                    disabled={busy || leaving}
                                                    onClick={() => runAction(memberId, grantChatAdmin)}
                                                >
                                                    Make admin
                                                </button>
                                            )}
                                        </span>
                                    )}
                                    {isAdmin && (isSelf || !isViewerAdmin) && (
                                        <span className="group-settings-admin">Admin</span>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
                {error && <p className="group-settings-error">{error}</p>}
                {isFull && <p className="group-settings-hint">A group can have at most 50 people.</p>}
                <button
                    type="button"
                    className="group-settings-add"
                    disabled={leaving || busyUserId !== null || (!picking && isFull)}
                    onClick={() => {
                        setPicking((open) => !open);
                        setError('');
                    }}
                >
                    {picking ? 'Back' : 'Add to chat'}
                </button>
                <button
                    type="button"
                    className="group-settings-leave"
                    disabled={leaving || busyUserId !== null}
                    onClick={leaveChat}
                >
                    Leave chat
                </button>
            </div>
        </div>
    );
}

export default GroupChatSettings;
