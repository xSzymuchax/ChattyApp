import createApi from './createApi';
import { apiBaseUrl } from '../config/endpoints';

const authApi = createApi(`${apiBaseUrl}/auth`);

export default authApi;