import axios from 'axios'

var axiosInstance = axios.create({
  baseURL: process.env.API_HOST_PORT,
  withCredentials: true,
});

export default axiosInstance
