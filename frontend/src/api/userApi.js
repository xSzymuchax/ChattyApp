import createApi from './createApi';
import { apiBaseUrl } from '../config/endpoints';

const userApi = createApi(apiBaseUrl);

export default userApi;