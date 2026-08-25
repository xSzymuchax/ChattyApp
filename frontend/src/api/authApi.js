import createApi from './createApi';

const authApi = createApi(import.meta.env.VITE_AUTH_API_URL);

export default authApi;