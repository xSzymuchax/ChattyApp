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
    const [loginError, setLoginError] = useState('');
    const [registerError, setRegisterError] = useState('');
    const [registerSuccess, setRegisterSuccess] = useState('');

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

    const showLogin = () => {
        setisLoginTabSelected(true);
        setRegisterError('');
        setLoginError('');
    } 

    const showRegister = () => {
        setisLoginTabSelected(false);
        setRegisterError('');
        setLoginError('');
        setRegisterSuccess('');
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        setRegisterSuccess('');

        try {
            const response = await login(
                loginForm.email,
                loginForm.password
            );

            saveToken(response.data.token);
            navigate('/mainPage');
        } catch (error){
            setLoginError('Could not log in.');
        }
        
    }

    const handleRegister = async (e) => {
        e.preventDefault();
        setRegisterError('');
        setRegisterSuccess('');

        try {
            await register(
                registerForm.username,
                registerForm.email,
                registerForm.password,
                registerForm.passwordConfirm
            );

            setRegisterForm({
                username: '',
                email: '',
                password: '',
                passwordConfirm: ''
            });
            setRegisterSuccess('Account created. You can log in.');
            setisLoginTabSelected(true);
        } catch (error) {
            const status = error.response?.status;
            const code = error.response?.data?.code;

            if (status === 409 || code === 'ACCOUNT_EXISTS') {
                setRegisterError('Username or email is already taken.');
                return;
            }

            if (code === 'WEAK_PASSWORD') {
                setRegisterError('Password is too weak.');
                return;
            }

            if (code === 'PASSWORD_MISMATCH') {
                setRegisterError('Passwords do not match.');
                return;
            }

            setRegisterError('Could not register.');
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
                                type='password' 
                                name='password' 
                                value={loginForm.password}
                                onChange={handleLoginValueChanged}>
                            </input>

                            <button type='submit'>LOGIN</button>
                            {loginError && (
                                <p className="form-error">{loginError}</p>
                            )}
                            {registerSuccess && (
                                <p className="form-success">{registerSuccess}</p>
                            )}
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
                                type='password' 
                                name='password' 
                                value={registerForm.password}
                                onChange={handleRegisterValueChanged}>
                            </input>
                            
                            <label htmlFor='passwordConfirm'>Confirm Password:</label>
                            <input 
                                type='password' 
                                name='passwordConfirm'
                                value={registerForm.passwordConfirm}
                                onChange={handleRegisterValueChanged}>
                            </input>
                            
                            <button type='submit'>Register</button>
                            {registerError && (
                                <p className="form-error">{registerError}</p>
                            )}
                        </form>
                    </div>
                )}
                
            </div> 
        </div>
    );
}

export default LoginRegister