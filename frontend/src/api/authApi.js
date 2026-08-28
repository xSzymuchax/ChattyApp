import createApi from './createApi';

const authApi = createApi(`${import.meta.env.VITE_API_URL}/auth`);

export default authApi;