import authApi from "./authApi";

export const register = (username, email, password, passwordConfirm) => {
    return authApi.post(
        '/register',
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
        '/login',
        {
            email: email,
            password: password
        }
    )
}

