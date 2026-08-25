import { useState } from 'react';
import { register } from '../api/auth';

import './LoginRegister.css';

function LoginRegister(){
    const [isLoginTabSelected, setisLoginTabSelected] = useState(true);
    const [registerForm, setRegisterForm] = useState({
        username: '',
        email: '',
        password: '',
        passwordConfirm: ''
    });

    const handleValueChanged = (e) => {
        const { name, value } = e.target;

        setRegisterForm((prev) => ({
            ...prev,
            [name]: value
        }));
    }

    const showLogin = (e) => {
        setisLoginTabSelected(true);
    } 

    const showRegister = (e) => {
        setisLoginTabSelected(false);
    }

    const handleLogin = (e) => {
        e.preventDefault();


    }

    const handleRegister = async (e) => {
        e.preventDefault();

        const response = await register(
            registerForm.username,
            registerForm.email,
            registerForm.password,
            registerForm.passwordConfirm
        );
    }

    return (
        <div className="login-register">
            <div className='tab-switcher'>
                <div className='toggle-login' onClick={showLogin}>LOGIN</div>
                <div className='toggle-register' onClick={showRegister}>REGISTER</div>
            </div>

            <div className='container'>
                {isLoginTabSelected==true && (
                    <div className='login'>
                        <form className='l-r-form'>
                            <label htmlFor='username'>Username:</label>
                            <input type='textbox' name='username' id='username'></input>
                            <label htmlFor='username'>Password:</label>
                            <input type='textbox' name='username' id='username'></input>
                            <button onClick={handleLogin}>LOGIN</button>
                        </form>
                    </div>
                )}
                
                {isLoginTabSelected==false && (
                    <div className='register'>
                        <form className='l-r-form' onSubmit={handleRegister}>
                            <label htmlFor='username'>Username:</label>
                            <input 
                                type='textbox' 
                                name='username' 
                                value={registerForm.username}
                                onChange={handleValueChanged}>     
                            </input>

                            <label htmlFor='email'>Email:</label>
                            <input 
                                type='textbox' 
                                name='email'
                                value={registerForm.email}
                                onChange={handleValueChanged}>
                            </input>

                            <label htmlFor='password'>Password:</label>
                            <input 
                                type='textbox' 
                                name='password' 
                                value={registerForm.password}
                                onChange={handleValueChanged}>
                            </input>
                            
                            <label htmlFor='passwordConfirm'>Confirm Password:</label>
                            <input 
                                type='textbox' 
                                name='passwordConfirm'
                                value={registerForm.passwordConfirm}
                                onChange={handleValueChanged}>
                            </input>
                            
                            <button type='submit'>Register</button>
                        </form>
                    </div>
                )}
                
            </div> 
        </div>
    );
}

export default LoginRegister