import axios from 'axios';

const API_BASE_URL = import.meta.env.API_URL;

console.log(`API_BASE_URL: ${API_BASE_URL}`);


const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});


export default axiosInstance;
