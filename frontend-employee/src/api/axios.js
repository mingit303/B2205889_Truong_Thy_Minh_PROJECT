import axios from "axios";
import { useAuthStore } from "../stores/auth";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // chỉnh lại nếu BE khác port
});

// Gắn token vào mỗi request
api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
});

// Xử lý 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const authStore = useAuthStore();
    if (error.response && error.response.status === 401) {
      authStore.logout();
    }
    return Promise.reject(error);
  }
);

export default api;
