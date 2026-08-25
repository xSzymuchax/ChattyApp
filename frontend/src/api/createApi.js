import axios from 'axios';

const TOKEN_KEY='chatty.authToken'

const createApi = (baseURL) => {
    const api = axios.create({
        baseURL
    });

    api.interceptors.request.use((config) => {
        const token = localStorage.getItem('chatty.authToken');

        if (token)
            config.headers.Authorization = `Bearer ${token}`;

        return config;
    });
    return api;
}

export default createApi;