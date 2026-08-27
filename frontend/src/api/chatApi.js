import createApi from './createApi';

const chatApi = createApi(import.meta.env.VITE_CHAT_API_URL);

export default chatApi;