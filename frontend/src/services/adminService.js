import api from './api.js';

export const adminService = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },
  updateOrganizationStatus: async (payload) => {
    const response = await api.put('/admin/approve-org', payload);
    return response.data;
  },
};
