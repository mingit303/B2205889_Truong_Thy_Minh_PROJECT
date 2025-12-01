import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/reader",
});

// Gửi token độc giả
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("reader_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default http;
