import api from './api.js';

export const orgService = {
  getDashboard: async () => {
    const response = await api.get('/org/dashboard');
    return response.data;
  },
  verifyByQr: async (uniqueId) => {
    const response = await api.get(`/org/verify/${uniqueId}`);
    return response.data;
  },
  requestOtp: async (uniqueID) => {
    const response = await api.post('/org/request-otp', { uniqueID });
    return response.data;
  },
  verifyByOtp: async (payload) => {
    const response = await api.post('/org/verify-otp', payload);
    return response.data;
  },
};
