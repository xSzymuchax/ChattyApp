import { useEffect, useState } from 'react';
import { getUserById, updateUserById } from '../../api/user';
import { useAuth } from '../../auth/AuthContext'
import './ProfileDisplay.css'


function ProfileDisplay() {
    const {logout, userId} = useAuth();
    const [username, setUsername] = useState('');
    const [description, setDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            if (!userId) {
                return;
            }

            try {
                const response = await getUserById(userId);
                setUsername(response.data.username ?? '');
                setDescription(response.data.description ?? '');
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
                <button type='button' disabled>Choose PFP</button>

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
