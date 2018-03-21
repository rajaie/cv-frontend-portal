import axios from 'axios'

var axiosInstance = axios.create({
  baseURL: process.env.API_HOST_PORT,
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

export default axiosInstance
