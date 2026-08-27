import createApi from './createApi';

const userApi = createApi(import.meta.env.VITE_USER_API_URL);

export default userApi;