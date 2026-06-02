import axios from 'axios';

const fallbackApiUrl = import.meta.env.PROD
  ? 'https://ebp06-2026-i-production.up.railway.app'
  : 'http://localhost:8080';

const apiUrl = (import.meta.env.VITE_API_URL || fallbackApiUrl).replace(/\/+$/, '');

const api = axios.create({
  baseURL: `${apiUrl}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default api;
