import { useState } from 'react';
import { login, register } from '../api/auth';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

import './LoginRegister.css';


function LoginRegister(){
    const navigate = useNavigate();
    const { login: saveToken } = useAuth();
    const [isLoginTabSelected, setisLoginTabSelected] = useState(true);
    const [registerForm, setRegisterForm] = useState({
        username: '',
        email: '',
        password: '',
        passwordConfirm: ''
    });

    const [loginForm, setLoginForm] = useState({
        email: '',
        password: ''
    });

    const handleRegisterValueChanged = (e) => {
        const { name, value } = e.target;

        setRegisterForm((prev) => ({
            ...prev,
            [name]: value
        }));
    }

    const handleLoginValueChanged = (e) => {
        const { name, value } = e.target;

        setLoginForm((prev) => ({
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

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await login(
                loginForm.email,
                loginForm.password
            );

            saveToken(response.data.token);
            navigate('/mainPage');
        } catch (error){
            console.log(error);
        }
        
    }

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const response = await register(
                registerForm.username,
                registerForm.email,
                registerForm.password,
                registerForm.passwordConfirm
            );
        } catch (error) {
            alert(error);
        }
        
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
                        <form className='l-r-form' onSubmit={handleLogin}>
                            <label htmlFor='email'>Email:</label>
                            <input 
                                type='textbox' 
                                name='email' 
                                value={loginForm.email}
                                onChange={handleLoginValueChanged}>
                            </input>

                            <label htmlFor='password'>Password:</label>
                            <input 
                                type='textbox' 
                                name='password' 
                                value={loginForm.password}
                                onChange={handleLoginValueChanged}>
                            </input>

                            <button type='submit'>LOGIN</button>
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
                                onChange={handleRegisterValueChanged}>     
                            </input>

                            <label htmlFor='email'>Email:</label>
                            <input 
                                type='textbox' 
                                name='email'
                                value={registerForm.email}
                                onChange={handleRegisterValueChanged}>
                            </input>

                            <label htmlFor='password'>Password:</label>
                            <input 
                                type='textbox' 
                                name='password' 
                                value={registerForm.password}
                                onChange={handleRegisterValueChanged}>
                            </input>
                            
                            <label htmlFor='passwordConfirm'>Confirm Password:</label>
                            <input 
                                type='textbox' 
                                name='passwordConfirm'
                                value={registerForm.passwordConfirm}
                                onChange={handleRegisterValueChanged}>
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