import userApi from "./userApi";

export const getUserWithUsername = (username) => {
    return userApi.post('/user',
        {
            params: {
                username
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