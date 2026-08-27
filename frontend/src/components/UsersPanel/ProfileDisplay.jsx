import { useAuth } from '../../auth/AuthContext'
import './ProfileDisplay.css'


function ProfileDisplay() {
    const {logout} = useAuth();   

    return (
        <div className='profile-display'>
            <form>
                <label htmlFor='username'>Username</label>
                <input id='username' name='username'></input>
                            
                <label htmlFor='description'>Description</label>
                <input id='description' name='description'></input>

                <label htmlFor='pfp'>PFP select</label>
                <button>Choose PFP</button>

                <br></br>
                <br></br>
                <br></br>
                <button>SAVE</button>
            </form>

            <button onClick={logout}>LOG OUT</button>
        </div>
    )
}

export default ProfileDisplay