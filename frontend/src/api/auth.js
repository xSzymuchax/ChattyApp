import authApi from "./authApi";

export const register = (username, email, password, passwordConfirm) => {
    return authApi.post(
        '/auth/register',
        {
            username: username,
            email: email,
            password: password,
            passwordConfirm: passwordConfirm
        }
    );
}

export const login = (email, password) => {
    return authApi.post(
        '/auth/login',
        {
            email: email,
            password: password
        }
    )
}

