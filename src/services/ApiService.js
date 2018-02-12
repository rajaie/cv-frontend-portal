import axios from 'axios'
import config from '@/config/config'

var axiosInstance = axios.create({
  baseURL: config.apiEndpoint,
});

export default axiosInstance
