import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Axios tự động set Content-Type cho FormData, không cần set thủ công
  // Nếu set thủ công sẽ làm mất boundary và gây lỗi
  if (config.data instanceof FormData) {
    // Không set Content-Type, để axios tự động set với boundary
    delete config.headers['Content-Type'];
  }
  return config;
});

// Response interceptor để xử lý lỗi và extract message từ backend
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Nếu có response từ server, lấy message từ response.data.message
    if (error.response && error.response.data && error.response.data.message) {
      const customError = new Error(error.response.data.message);
      (customError as any).response = error.response;
      return Promise.reject(customError);
    }
    // Nếu không có message từ server, giữ nguyên error
    return Promise.reject(error);
  }
);

export default api;