import { useEffect, useState } from 'react';
import SearchBar from '../SearchBar';
import UserAvatar from '../UserAvatar';
import { useAuth } from '../../auth/AuthContext';
import { getUserWithMatchingUsername } from '../../api/user';
import { createGroupChat } from '../../api/chat';
import './CreateGroupChat.css';

const MAX_NAME_LENGTH = 80;
const MIN_OTHERS = 2;
const MAX_OTHERS = 49;

function CreateGroupChat({ onClose, onCreated }) {
    const { userId } = useAuth();
    const [name, setName] = useState('');
    const [foundUsers, setFoundUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState({});
    const [hasSearched, setHasSearched] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

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
            setFoundUsers(users.filter((user) => Number(user.id) !== Number(userId)));
            setHasSearched(true);
        } catch (searchError) {
            console.log(searchError);
            setFoundUsers([]);
            setHasSearched(true);
        }
    };

    const toggleUser = (user) => {
        const id = Number(user.id);

        setSelectedUsers((prev) => {
            const next = { ...prev };

            if (next[id]) {
                delete next[id];
            } else {
                next[id] = user;
            }

            return next;
        });
        setError('');
    };

    const selectedList = Object.values(selectedUsers);
    const groupName = name.trim();
    const canCreate = groupName.length > 0
        && groupName.length <= MAX_NAME_LENGTH
        && selectedList.length >= MIN_OTHERS
        && selectedList.length <= MAX_OTHERS
        && !submitting;

    const handleAccept = async () => {
        if (!canCreate) {
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const memberIds = [Number(userId), ...selectedList.map((user) => Number(user.id))];
            const response = await createGroupChat(memberIds, groupName);
            onCreated(response.data);
        } catch (createError) {
            console.log(createError);
            setError(createError.response?.data?.message || 'Could not create the group.');
            setSubmitting(false);
        }
    };

    return (
        <div className="create-group-overlay" onClick={onClose}>
            <div
                className="create-group-dialog"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-group-title"
            >
                <h2 id="create-group-title">New group</h2>
                <input
                    className="create-group-name"
                    type="text"
                    value={name}
                    maxLength={MAX_NAME_LENGTH}
                    placeholder="Group name"
                    aria-label="Group name"
                    onChange={(event) => {
                        setName(event.target.value);
                        setError('');
                    }}
                />
                <SearchBar onSearch={searchUsers} />
                <div className="create-group-list">
                    {foundUsers.length === 0 ? (
                        <p className="create-group-empty">
                            {hasSearched ? 'No users found' : 'Search for people to add'}
                        </p>
                    ) : (
                        foundUsers.map((user) => {
                            const id = Number(user.id);
                            const checked = Boolean(selectedUsers[id]);

                            return (
                                <label key={id} className="create-group-user">
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => toggleUser(user)}
                                    />
                                    <span className="profile-picture">
                                        <UserAvatar
                                            userId={user.id}
                                            username={user.username}
                                            hasAvatar={user.hasAvatar}
                                            version={user.updatedAt}
                                        />
                                    </span>
                                    <span className="username">{user.username}</span>
                                </label>
                            );
                        })
                    )}
                </div>
                {error && <p className="create-group-error">{error}</p>}
                {!canCreate && !submitting && (
                    <p className="create-group-hint">
                        {selectedList.length > MAX_OTHERS
                            ? 'A group can have at most 50 people.'
                            : 'Add a name and at least two people.'}
                    </p>
                )}
                <button
                    type="button"
                    className="create-group-accept"
                    disabled={!canCreate}
                    onClick={handleAccept}
                >
                    Create group
                </button>
            </div>
        </div>
    );
}

export default CreateGroupChat;
