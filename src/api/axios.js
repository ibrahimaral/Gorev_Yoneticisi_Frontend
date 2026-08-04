import axios from 'axios';

// Django backend servisinin ana adresi
const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor (Araya Girici):
// Atılan HER isteğin başlığına (Header) localStorage'daki JWT token'ı otomatik ekler.
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;