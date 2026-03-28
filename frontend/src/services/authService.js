import api from './api.js';

export const authService = {
  login: async (payload) => {
    const response = await api.post('/auth/login', payload);
    return response.data;
  },
  registerUser: async (payload) => {
    const response = await api.post('/auth/register', payload);
    return response.data;
  },
  registerOrganization: async (payload) => {
    const response = await api.post('/org/register', payload);
    return response.data;
  },
  forgotPassword: async (payload) => {
    const response = await api.post('/auth/forgot-password', payload);
    return response.data;
  },
  resetPassword: async (payload) => {
    const response = await api.post('/auth/reset-password', payload);
    return response.data;
  },
};
