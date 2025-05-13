import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

console.log(`API_BASE_URL: ${API_BASE_URL}`);


const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Để gửi cookie cùng với yêu cầu
});

// Interceptor: nếu gặp lỗi 403 (token hết hạn), tự gọi /refresh và thử lại request cũ
axiosInstance.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axiosInstance.post('/api/users/refresh-token');
        return axiosInstance(originalRequest); // thử lại request cũ
      } catch (refreshError) {
        console.error('Không thể làm mới access token:', refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
