import createApi from './createApi';

const authApi = createApi(import.meta.env.VITE_API_URL);

export default authApi;