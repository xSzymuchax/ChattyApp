import userApi from "./userApi";

export const getUserWithMatchingUsername = (username) => {
    return userApi.get('/user',
        {
            params: {
                username: username
            }
        }
    );
}

export const getUserById = (id) => {
    return userApi.get(`/user/${id}`);
}

export const updateUserById = (id, data) => {
    return userApi.put(`/user/${id}`, data);
}