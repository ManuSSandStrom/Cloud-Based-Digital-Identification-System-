import axios from 'axios';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'https://cloud-based-digital-identification-system.onrender.com/api',
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
