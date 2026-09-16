import { useEffect, useRef, useState } from 'react';
import { getUserById, updateUserAvatar, updateUserById } from '../../api/user';
import { useAuth } from '../../auth/AuthContext'
import UserAvatar from '../UserAvatar';
import './ProfileDisplay.css'


function ProfileDisplay() {
    const {logout, userId} = useAuth();
    const fileInputRef = useRef(null);
    const [username, setUsername] = useState('');
    const [description, setDescription] = useState('');
    const [avatarVersion, setAvatarVersion] = useState('');
    const [hasAvatar, setHasAvatar] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            if (!userId) {
                return;
            }

            try {
                const response = await getUserById(userId);
                setUsername(response.data.username ?? '');
                setDescription(response.data.description ?? '');
                setAvatarVersion(response.data.updatedAt ?? '');
                setHasAvatar(Boolean(response.data.hasAvatar));
            } catch (error) {
                console.log(error);
            }
        };

        loadProfile();
    }, [userId]);

    const handleSave = async (event) => {
        event.preventDefault();

        if (!userId || isSaving) {
            return;
        }

        setIsSaving(true);

        try {
            const response = await updateUserById(userId, {
                description,
            });
            setDescription(response.data.description ?? '');
        } catch (error) {
            console.log(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChoosePfp = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarSelected = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file || !userId || isUploadingAvatar) {
            return;
        }

        setIsUploadingAvatar(true);

        try {
            const response = await updateUserAvatar(userId, file);
            setAvatarVersion(response.data.updatedAt ?? Date.now().toString());
            setHasAvatar(true);
        } catch (error) {
            console.log(error);
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    return (
        <div className='profile-display'>
            <form onSubmit={handleSave}>
                <label htmlFor='username'>Username</label>
                <input
                    id='username'
                    name='username'
                    value={username}
                    readOnly
                    disabled
                />
                            
                <label htmlFor='description'>Description</label>
                <input
                    id='description'
                    name='description'
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    maxLength={255}
                />

                <label htmlFor='pfp'>PFP select</label>
                <div className="pfp-row">
                    <div className="profile-picture">
                        <UserAvatar
                            userId={userId}
                            username={username}
                            hasAvatar={hasAvatar}
                            version={avatarVersion}
                        />
                    </div>
                    <input
                        id="pfp"
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        hidden
                        onChange={handleAvatarSelected}
                    />
                    <button
                        type="button"
                        onClick={handleChoosePfp}
                        disabled={isUploadingAvatar}
                    >
                        Choose PFP
                    </button>
                </div>

                <br></br>
                <br></br>
                <br></br>
                <button type='submit' disabled={isSaving}>
                    <i className="icon-floppy"></i> SAVE
                </button>
            </form>

            <button type='button' onClick={logout}>
                <i className="icon-logout"></i> LOG OUT
            </button>
        </div>
    )
}

export default ProfileDisplay
