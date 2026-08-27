import axios from 'axios';

const createApi = (baseURL) => {
    const api = axios.create({
        baseURL
    });

    api.interceptors.request.use((config) => {
        const token = localStorage.getItem(import.meta.env.VITE_TOKEN_KEY);

        if (token)
            config.headers.Authorization = `Bearer ${token}`;

        return config;
    });
    return api;
}

export default createApi;