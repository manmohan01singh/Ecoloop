import axios from 'axios';

const API_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || '/api');

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('circuvio_token') || localStorage.getItem('ecoloop_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('circuvio_token');
      localStorage.removeItem('circuvio_user');
      localStorage.removeItem('ecoloop_token');
      localStorage.removeItem('ecoloop_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
