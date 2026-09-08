import createApi from './createApi';
import { apiBaseUrl } from '../config/endpoints';

const chatApi = createApi(apiBaseUrl);

export default chatApi;