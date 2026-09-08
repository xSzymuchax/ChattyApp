import createApi from './createApi';
import { apiBaseUrl } from '../config/endpoints';

const gameApi = createApi(apiBaseUrl);

export default gameApi;
