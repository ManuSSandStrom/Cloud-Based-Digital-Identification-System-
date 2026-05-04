import axios from 'axios';

const AUTH_STORAGE_KEY = 'digital-id-auth';

const normalizeApiBaseUrl = (value) => {
  const trimmedValue = (value || '').trim().replace(/\/+$/, '');

  if (!trimmedValue) {
    return 'https://cloud-based-digital-identification-system.onrender.com/api';
  }

  return trimmedValue.endsWith('/api') ? trimmedValue : `${trimmedValue}/api`;
};

const api = axios.create({
  baseURL: normalizeApiBaseUrl(import.meta.env.VITE_API_URL),
});

api.interceptors.request.use((config) => {
  const savedState = localStorage.getItem(AUTH_STORAGE_KEY);

  if (savedState) {
    const { token } = JSON.parse(savedState);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(AUTH_STORAGE_KEY);

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export default api;
