import axios from 'axios';

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
  const savedState = localStorage.getItem('digital-id-auth');

  if (savedState) {
    const { token } = JSON.parse(savedState);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default api;
