import axios from 'axios'

function getAuthHeader() {
  const token = localStorage.getItem('token');

  return token ? {Authorization: `Bearer ${token}`} : {}
}

var axiosInstance = axios.create({
  baseURL: process.env.API_HOST_PORT,
  headers: getAuthHeader()
});

export default axiosInstance
