import userApi from "./userApi";
import { apiBaseUrl } from "../config/endpoints";

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

export const updateUserAvatar = (id, file) => {
    const formData = new FormData();
    formData.append("avatar", file);

    return userApi.put(`/user/${id}/avatar`, formData);
}

export const userAvatarUrl = (userId, version) => {
    if (!userId) {
        return "";
    }

    const query = version ? `?v=${encodeURIComponent(version)}` : "";
    return `${apiBaseUrl}/user/${userId}/avatar${query}`;
}