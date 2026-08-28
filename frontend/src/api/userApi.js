import createApi from './createApi';

const userApi = createApi(import.meta.env.VITE_API_URL);

export default userApi;